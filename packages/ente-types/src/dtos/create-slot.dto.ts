import { IsDate, IsNumber, Min, Max, IsUUID } from "class-validator";
import { CompareToProperty } from "../helpers/compare-to-property";

export class CreateSlotDto {
  @IsDate() date: Date;

  @IsNumber()
  @Min(1)
  @Max(13)
  from: number;

  @IsNumber()
  @Min(1)
  @Max(13)
  @CompareToProperty("from", (to, from) => to >= from)
  to: number;

  @IsUUID() teacherId: string;
}