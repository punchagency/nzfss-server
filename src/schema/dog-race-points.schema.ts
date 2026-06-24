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

  @Field(() => Number)
  cutoffPoints: number;

  @Field(() => String)
  awards: string;
}
