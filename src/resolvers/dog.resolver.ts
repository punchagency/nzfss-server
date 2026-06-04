import { Resolver, FieldResolver, Root } from "type-graphql";
import { Dog } from "../schema/musher.schema";
import { generateDogId, isValidDogId } from "../utils/dog-id";

@Resolver(() => Dog)
export class DogResolver {
  @FieldResolver(() => String, { nullable: true })
  dogId(@Root() dog: Record<string, unknown>): string | null {
    const id = dog.dogId as string | undefined;
    if (id && isValidDogId(id)) return id;
    return null;
  }

  @FieldResolver(() => String, { nullable: true })
  _id(@Root() dog: Record<string, unknown>): string | null {
    const id = (dog.dogId || dog._id) as string | undefined;
    if (id && isValidDogId(id)) return id;
    return null;
  }
}

/** Ensures every dog document written to MongoDB has a valid dogId */
export function ensureDogIdsForSave<T extends { dogId?: string }>(
  dogs: T[]
): Array<T & { dogId: string }> {
  const used = new Set<string>();
  return dogs.map((dog) => {
    let dogId = dog.dogId;
    if (!isValidDogId(dogId)) dogId = generateDogId();
    while (used.has(dogId)) dogId = generateDogId();
    used.add(dogId);
    return { ...dog, dogId };
  });
}
