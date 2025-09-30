import _ from "lodash";
import { collectionNames } from "../../../configserver";
import { getInstance } from "../helpers/databaseStorageHelper";

export interface UserInterface {
  id: number;
  email: string;
  name: string;
  wallet_address: string;
}

export interface OAuthPayload {
  address: string;
  credentialId: string | undefined;
  email: string;
  orgId: string;
  solanaAddress: string;
  type: string;
  userId: string;
}
export const _getCustomer = async (id: number): Promise<UserInterface> => {
  try {
    const User = getInstance(collectionNames.USER);
    const customer = await User.findOne({
      where: { id },
      attributes: [
        "id",
        "email",
        "phonenumber",
        "name",
        "wallet_address",
        "profile_icon",
      ],
    });
    if (!customer) throw { message: "User not found" };
    return customer;
  } catch (e) {
    throw e;
  }
};

export const _loginCustomer = async (_payload: OAuthPayload) => {
  const User = getInstance(collectionNames.USER);

  try {
    let customer = await User.findOne({
      where: { alchemy_user_id: _payload.userId },
    });
    if (!customer) {
      const userPayload = {
        email: _payload.email,
        alchemy_user_id: _payload.userId,
        wallet_address: _payload.address,
        // TODO: create image for user as well encoding th userPayload
        profile_icon: "",
      };

      customer = await User.create(userPayload);
    }

    return _.pick(
      customer,
      "name",
      "email",
      "wallet_address",
      "alchemy_user_id",
      "profile_icon"
    );
  } catch (e) {
    throw e;
  }
};
