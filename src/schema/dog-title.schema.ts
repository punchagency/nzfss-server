import { Field, InputType, ObjectType } from "type-graphql";

/** A dog whose highest earned sled-dog title has not yet been recognised. */
@ObjectType()
export class UnrecognisedTitleChange {
  @Field(() => String)
  dogId: string;

  @Field(() => String)
  musherId: string;

  @Field(() => String, { nullable: true })
  dogName?: string;

  @Field(() => String, { nullable: true })
  pedigreeName?: string;

  @Field(() => String, { nullable: true })
  nzfssNo?: string;

  @Field(() => String, { nullable: true })
  ownerName?: string;

  @Field(() => String, { nullable: true })
  breed?: string;

  /** Highest currently recognised title (label), or "None". */
  @Field(() => String)
  previousTitle: string;

  /** Highest earned title (label) awaiting recognition. */
  @Field(() => String)
  newTitle: string;

  /** Title codes for export/programmatic use. */
  @Field(() => String, { nullable: true })
  previousTitleCode?: string;

  @Field(() => String)
  newTitleCode: string;

  @Field(() => Number)
  points: number;

  @Field(() => Number)
  events: number;
}

@InputType()
export class RecogniseTitleChangesInput {
  @Field(() => [String])
  dogIds: string[];
}

@ObjectType()
export class RecogniseTitleChangesResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => Number)
  recognisedCount: number;

  @Field(() => String, { nullable: true })
  message?: string;
}
