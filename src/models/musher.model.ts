import { getModelForClass, modelOptions, prop as Property } from "@typegoose/typegoose";

/** Per-title "certificate issued" flags. Title achievement itself is derived from points. */
class TitleRecognition {
  @Property({ type: Boolean, default: false })
  sd: boolean;

  @Property({ type: Boolean, default: false })
  sdx: boolean;

  @Property({ type: Boolean, default: false })
  sdCh: boolean;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Dog {
  @Property({ type: String, required: false, immutable: true })
  dogId?: string;

  @Property({ required: false })
  name: string;

  @Property({ type: String, required: false })
  pedigreeName: string;

  @Property({ type: String, required: false })
  nzkcNo: string;

  @Property({ type: String, required: false })
  nzfssNo: string;

  @Property({ type: String, required: false })
  dateOfBirth: string;

  @Property({ type: String, required: false })
  breed: string;

  @Property({ type: Boolean, default: false })
  deceased: boolean;

  @Property({ type: () => TitleRecognition, _id: false, required: false })
  titleRecognition?: TitleRecognition;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Musher {
  @Property({ required: true })
  name: string;

  @Property({ type: String, required: false })
  registrationNo: string;

  @Property({ type: String, required: false })
  kennelRegistrationNo: string;

  @Property({ ref: "Club", required: true })
  club: string;

  @Property({ type: String, required: false })
  address: string;

  @Property({ type: String, required: false })
  phone: string;

  @Property({ type: String, required: false })
  email: string;

  @Property({ type: String, required: false })
  dateOfBirth: string;

  @Property({ type: String, required: false })
  guardianDetails: string;

  @Property({ type: () => [Dog], _id: false })
  dogs: Dog[];
  
  @Property({ type: Boolean, default: false })
  showProfileConsent: boolean;
}

export const MusherModel = getModelForClass(Musher); 