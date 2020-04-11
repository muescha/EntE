import { createParamDecorator } from "@nestjs/common";
import { Request } from "express";
import { UserDto, Roles } from "@@types";
import { Maybe } from "monet";

export interface WithId {
  id: string;
}

export interface WithChildrenIds {
  childrenIds: string[];
}

export interface WithRole {
  role: Roles;
}

export interface WithAdminState {
  isAdmin: boolean;
}

export interface WithUsername {
  username: string;
}

export interface WithDisplayname {
  displayname: string;
}

export interface RequestContextUser
  extends WithId,
    WithChildrenIds,
    WithRole,
    WithUsername,
    WithAdminState,
    WithDisplayname {
  getDto: () => Promise<Maybe<UserDto>>;
}

export type RequestContext<T = {}> = T & {
  user: RequestContextUser;
};

export const Ctx = createParamDecorator(
  (_, req: Request): RequestContext => {
    const user = req.user as RequestContextUser;
    return { user };
  }
);
