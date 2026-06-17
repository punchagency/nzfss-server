import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class DogRacePointSummary {
  @Field(() => String)
  name: string;

  @Field(() => String)
  regNumber: string;

  @Field(() => String)
  breed: string;

  @Field(() => Number)
  pointsWithinCutoff: number;

  @Field(() => Number)
  pointsOutsideCutoff: number;

  @Field(() => Number)
  events: number;

  /** Average event cutoff time in seconds; null when no cutoff data exists. */
  @Field(() => Number, { nullable: true })
  avgCutoffSeconds?: number | null;

  @Field(() => String)
  awards: string;
}
