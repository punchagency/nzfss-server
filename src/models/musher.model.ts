import { getModelForClass, modelOptions, prop as Property } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { timestamps: true } })
class Dog {
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

  @Property({ type: () => [Dog], _id: false })
  dogs: Dog[];
  
  @Property({ type: Boolean, default: false })
  showProfileConsent: boolean;
}

export const MusherModel = getModelForClass(Musher); 