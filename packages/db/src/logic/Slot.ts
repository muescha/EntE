import { getRepository } from "typeorm";
import Slot from "../entity/Slot";
import { SlotId, ISlot, ISlotCreate, UserId } from "ente-types";
import { lastAugustFirst, twoWeeksInPast } from "../helpers/date";

const slotRepo = () => getRepository(Slot);

export const slotToJson = (slot: Slot): ISlot => ({
  _id: slot._id,
  date: slot.entry.date,
  hour_from: slot.hour_from,
  hour_to: slot.hour_to,
  student: slot.entry.student._id,
  signed: slot.entry.signedManager && slot.entry.signedParent,
  teacher: slot.teacher._id
});

const findByIds = async (ids: SlotId[]) => {
  const slots = await slotRepo().findByIds(ids);

  return slots.map(slotToJson);
};

const findById = async (id: SlotId) => {
  const slot = await slotRepo().findOneById(id);

  return !!slot ? slotToJson(slot) : null;
};

const afterDateQuery = (date: Date) =>
  slotRepo()
    .createQueryBuilder("slot")
    .leftJoin("slot.entry", "entry")
    .where("entry.date > :date", { date });

const thisYearQuery = () => afterDateQuery(lastAugustFirst());

const allThisYearByTeacher = async (teacherId: UserId) => {
  const slots = await thisYearQuery()
    .where({ teacher: { _id: teacherId } })
    .getMany();

  return slots.map(slotToJson);
};

const allThisYearByStudents = async (studentIds: UserId[]) => {
  const slots = await thisYearQuery()
    .where("slot.entry.student._id IN (:studentIds)", { studentIds })
    .getMany();

  return slots.map(slotToJson);
};

const allThisYear = async () => {
  const slots = await thisYearQuery().getMany();

  return slots.map(slotToJson);
};

const allTwoWeeksBefore = async () => {
  const slots = await afterDateQuery(twoWeeksInPast()).getMany();
  return slots.map(slotToJson);
};

export default {
  findByIds,
  findById,
  allThisYearByStudents,
  allThisYearByTeacher,
  allThisYear,
  allTwoWeeksBefore
};
