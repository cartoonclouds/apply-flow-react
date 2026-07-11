import { Repository, User } from "@/types";

type NewUser = Omit<User, "id">;

export class UserRepository implements Repository<
  User,
  NewUser,
  Partial<NewUser>,
  number
> {
  constructor(private readonly db: any) {}

  public async list(): Promise<User[]> {
    return [
      {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
      },
    ];
  }

  public async get(_id: number): Promise<User | null> {
    return {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
    };
  }

  public async create(data: NewUser): Promise<User> {
    return {
      id: 1,
      ...data,
    };
  }

  public async update(id: number, data: Partial<NewUser>): Promise<User> {
    const existing = await this.get(id);

    if (!existing) {
      throw new Error("User not found");
    }

    return {
      ...existing,
      ...data,
    };
  }

  public async delete(_id: number): Promise<void> {
    return;
  }

  public findById(id: number): Promise<User | null> {
    return this.get(id);
  }
}
