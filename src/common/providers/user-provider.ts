import { UserModel } from 'models';

export async function getUser(userToken: string): Promise<UserInstance> {
    const [user] = await UserModel.findOrCreate({
        where: {
            token: userToken,
        },
    });

    return user;
}
