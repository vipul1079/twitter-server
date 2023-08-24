import axios from "axios";
import { prisma } from "../clients/db";
import JWTservice from "./jwt";
interface GoogleTokenResult {
  iss?: string;
  azp?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified: string;
  nbf?: string;
  name?: string;
  picture?: string;
  given_name: string;
  family_name?: string;
  locale?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

class UserService {
  public static async verifyGoogleAuthToken(token: string) {
    const goolgeToken = token;
    const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOauthURL.searchParams.set("id_token", goolgeToken);

    const { data } = await axios.get<GoogleTokenResult>(
      googleOauthURL.toString(),
      {
        responseType: "json",
      }
    );

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageURL: data.picture,
        },
      });
    }
    const userInDb = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!userInDb) throw new Error("user with email not found");

    const userToken = JWTservice.generateTokenForUser(userInDb);

    return userToken;
  }

  public static getUserById(id:string){
    return prisma.user.findUnique({where:{id:id}});
  }
}

export default UserService;