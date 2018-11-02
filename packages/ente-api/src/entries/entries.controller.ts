import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Body,
  Put,
  NotFoundException,
  ForbiddenException,
  Inject,
  UseGuards,
  BadRequestException,
  Delete
} from "@nestjs/common";
import { RequestContext, Ctx } from "../helpers/request-context";
import {
  EntriesService,
  FindEntryFailure,
  CreateEntryFailure,
  SetForSchoolEntryFailure,
  SignEntryFailure,
  FindAllEntriesFailure,
  DeleteEntryFailure
} from "./entries.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateEntryDto, EntryDto } from "ente-types";
import { ValidationPipe } from "../helpers/validation.pipe";

@Controller("entries")
@UseGuards(AuthGuard("combined"))
export class EntriesController {
  constructor(
    @Inject(EntriesService) private readonly entriesService: EntriesService
  ) {}

  @Get()
  async findAll(@Ctx() ctx: RequestContext): Promise<EntryDto[]> {
    const entry = await this.entriesService.findAll(ctx.user);
    return entry.cata(fail => {
      switch (fail) {
        case FindAllEntriesFailure.ForbiddenForRole:
          throw new ForbiddenException();
      }
    }, e => e);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Ctx() ctx: RequestContext) {
    const result = await this.entriesService.findOne(id, ctx.user);
    return result.cata(fail => {
      switch (fail) {
        case FindEntryFailure.EntryNotFound:
          throw new NotFoundException();
        case FindEntryFailure.ForbiddenForUser:
          throw new ForbiddenException();
        default:
          throw new ForbiddenException();
      }
    }, entry => entry);
  }

  @Post()
  async create(
    @Body(new ValidationPipe())
    entry: CreateEntryDto,
    @Ctx() ctx: RequestContext
  ): Promise<EntryDto> {
    const result = await this.entriesService.create(entry, ctx.user);
    return result.cata(fail => {
      switch (fail) {
        case CreateEntryFailure.StudentIdMissing:
          throw new BadRequestException("StudentId Missing");
        case CreateEntryFailure.ForbiddenForUser:
          throw new ForbiddenException();
        case CreateEntryFailure.StudentNotFound:
          throw new BadRequestException("Student not found");
        case CreateEntryFailure.TeacherUnknown:
          throw new BadRequestException("Teacher not found");
        default:
          throw new ForbiddenException();
      }
    }, entry => entry);
  }

  @Patch(":id")
  async setForSchool(
    @Param("id") id: string,
    @Body() value: boolean,
    @Ctx() ctx: RequestContext
  ) {
    const result = await this.entriesService.setForSchool(id, value, ctx.user);
    return result.cata(fail => {
      switch (fail) {
        case SetForSchoolEntryFailure.EntryNotFound:
          throw new NotFoundException();
        case SetForSchoolEntryFailure.ForbiddenForRole:
          throw new ForbiddenException();
        default:
          throw new ForbiddenException();
      }
    }, entry => entry);
  }

  @Put(":id")
  async sign(
    @Param("id") id: string,
    @Body() value: boolean,
    @Ctx() ctx: RequestContext
  ) {
    const result = await this.entriesService.sign(id, value, ctx.user);
    return result.cata(fail => {
      switch (fail) {
        case SignEntryFailure.EntryNotFound:
          throw new NotFoundException();
        case SignEntryFailure.ForbiddenForUser:
          throw new ForbiddenException();
        default:
          throw new ForbiddenException();
      }
    }, entry => entry);
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @Ctx() ctx: RequestContext) {
    const result = await this.entriesService.delete(id, ctx.user);
    return result.cata(fail => {
      switch (fail) {
        case DeleteEntryFailure.NotFound:
          throw new NotFoundException();
        case DeleteEntryFailure.ForbiddenForRole:
        case DeleteEntryFailure.ForbiddenForUser:
          throw new ForbiddenException();
        default:
          throw new BadRequestException();
      }
    }, entry => entry);
  }
}