import { User } from "@/types";


export class UserRepository {
  constructor(private db: any) {}

    public async findById(_id: number): Promise<User | null> {
        return {
            id: 1,
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com"
        }
    }
}