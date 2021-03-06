/**
 * EntE
 * (c) 2017-present, Simon Knott <info@simonknott.de>
 *
 * This source code is licensed under the GNU Affero General Public License
 * found in the LICENSE file in the root directory of this source tree.
 */
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { IsInt } from "class-validator";
import { Entry } from "./entry.entity";
import { User } from "./user.entity";

/**
 * # Slot
 */
@Entity()
export class Slot {
  /**
   * ## Attributes
   */
  @PrimaryGeneratedColumn("uuid") readonly _id: string;

  @Column("date", { nullable: true })
  readonly date: string | null;

  @Column("int", { nullable: false })
  @IsInt()
  readonly hour_from: number;

  @Column("int", { nullable: false })
  @IsInt()
  readonly hour_to: number;

  /**
   * ## Relations
   */
  @ManyToOne((type) => User, (user) => user.slots, {
    nullable: true,
    onDelete: "SET NULL",
  })
  teacher: User | null = null;

  @ManyToOne((type) => Entry, (entry) => entry.slots, {
    nullable: true,
    onDelete: "CASCADE",
  })
  entry: Entry | null = null;

  @ManyToOne((type) => User, (user) => user.prefiledSlots, {
    nullable: true,
    onDelete: "CASCADE",
  })
  prefiledFor: User | null = null;
}
