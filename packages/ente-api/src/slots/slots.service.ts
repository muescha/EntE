import { Injectable, Inject, LoggerService } from "@nestjs/common";
import { Validation, Fail, Success } from "monet";
import { SlotRepo } from "../db/slot.repo";
import { Roles, SlotDto, twoWeeksBeforeNow } from "ente-types";
import { UserRepo } from "../db/user.repo";
import { EmailService } from "../email/email.service";
import { WinstonLoggerService } from "../winston-logger.service";
import { RequestContextUser } from "../helpers/request-context";

export enum FindOneSlotFailure {
  SlotNotFound,
  ForbiddenForUser
}

@Injectable()
export class SlotsService {
  constructor(
    @Inject(SlotRepo) private readonly slotRepo: SlotRepo,
    @Inject(UserRepo) private readonly userRepo: UserRepo,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(WinstonLoggerService) private readonly logger: LoggerService
  ) {}

  async findAll(requestingUser: RequestContextUser): Promise<SlotDto[]> {
    switch (requestingUser.role) {
      case Roles.ADMIN:
        return await this.slotRepo.findAll();

      case Roles.MANAGER:
        const user = (await requestingUser.getDto()).some();
        return await this.slotRepo.findByYearOfStudent(user.graduationYear!);

      case Roles.PARENT:
        return await this.slotRepo.findByStudents(
          ...requestingUser.childrenIds
        );

      case Roles.TEACHER:
        return await this.slotRepo.findHavingTeacher(requestingUser.id);

      case Roles.STUDENT:
        return await this.slotRepo.findByStudents(requestingUser.id);
    }
  }

  async findOne(
    id: string,
    requestingUser: RequestContextUser
  ): Promise<Validation<FindOneSlotFailure, SlotDto>> {
    const slot = await this.slotRepo.findById(id);

    const user =
      requestingUser.role === Roles.MANAGER &&
      (await requestingUser.getDto()).some();

    return slot.cata(
      () => Fail(FindOneSlotFailure.SlotNotFound),
      s => {
        switch (requestingUser.role) {
          case Roles.MANAGER:
            const isSameYear = s.student.graduationYear === user.graduationYear;
            if (!isSameYear) {
              return Fail(FindOneSlotFailure.ForbiddenForUser);
            }
            break;

          case Roles.PARENT:
            const slotMatchesUser = requestingUser.childrenIds.includes(
              s.student.id
            );
            if (!slotMatchesUser) {
              return Fail(FindOneSlotFailure.ForbiddenForUser);
            }
            break;

          case Roles.STUDENT:
            const slotBelongsStudent = s.student.id === requestingUser.id;
            if (!slotBelongsStudent) {
              return Fail(FindOneSlotFailure.ForbiddenForUser);
            }
            break;

          case Roles.TEACHER:
            const slotBelongsTeacher = s.teacher.id === requestingUser.id;
            if (!slotBelongsTeacher) {
              return Fail(FindOneSlotFailure.ForbiddenForUser);
            }
            break;
        }

        return Success(s);
      }
    );
  }

  async dispatchWeeklySummary() {
    this.logger.log("Starting do dispatch the weekly summary.");
    const teachers = await this.userRepo.findByRole(Roles.TEACHER);
    await Promise.all(
      teachers.map(async teacher => {
        const slots = await this.slotRepo.findHavingTeacherUpdatedSince(
          teacher.id,
          twoWeeksBeforeNow()
        );
        this.emailService.dispatchWeeklySummary(teacher, slots);
      })
    );
    this.logger.log("Weekly summary successfully dispatched.");
  }
}
