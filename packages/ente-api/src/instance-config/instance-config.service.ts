import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import {
  InstanceConfigDto,
  Languages,
  languagesArr,
  DEFAULT_DEFAULT_LANGUAGE,
  Roles,
  DEFAULT_PARENT_SIGNATURE_EXPIRY_TIME,
  DEFAULT_PARENT_SIGNATURE_NOTIFICATION_TIME,
  ParentSignatureTimesDto,
  isValidParentSignatureNotificationTime,
  isValidParentSignatureExpiryTime
} from "ente-types";
import * as _ from "lodash";
import { Maybe, Validation, Success, Fail } from "monet";
import { RequestContextUser } from "../helpers/request-context";
import { KeyValueStoreRepo } from "../db/keyvaluestore.repo";

export enum SetInstanceConfigValueFail {
  ForbiddenForRole,
  IllegalValue
}

const INSTANCE_CONFIG_KEYS = {
  DEFAULT_DEFAULT_LANGUAGE: "INSTANCE_CONFIG__DEFAULT_DEFAULT_LANGUAGE",
  LOGIN_BANNER: (l: Languages) => "INSTANCE_CONFIG__LOGIN_BANNER_" + l,
  PARENT_SIGNATURE_EXPIRY_TIME: "INSTANCE_CONFIG__PARENT_SIGNATURE_EXPIRY_TIME",
  PARENT_SIGNATURE_NOTIFICATION_TIME:
    "INSTANCE_CONFIG__PARENT_SIGNATURE_NOTIFICATION_TIME"
};

@Injectable()
export class InstanceConfigService implements OnModuleInit {
  constructor(
    @Inject(KeyValueStoreRepo)
    private readonly keyValueStoreRepo: KeyValueStoreRepo
  ) {}

  async onModuleInit() {
    await this.keyValueStoreRepo.setIfNotExists(
      INSTANCE_CONFIG_KEYS.DEFAULT_DEFAULT_LANGUAGE,
      DEFAULT_DEFAULT_LANGUAGE
    );
    await this.keyValueStoreRepo.setIfNotExists(
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_EXPIRY_TIME,
      "" + DEFAULT_PARENT_SIGNATURE_EXPIRY_TIME
    );
    await this.keyValueStoreRepo.setIfNotExists(
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_NOTIFICATION_TIME,
      "" + DEFAULT_PARENT_SIGNATURE_NOTIFICATION_TIME
    );
  }

  async getInstanceConfig(): Promise<InstanceConfigDto> {
    const values = await this.keyValueStoreRepo.getMultiple(
      INSTANCE_CONFIG_KEYS.DEFAULT_DEFAULT_LANGUAGE,
      ...languagesArr.map(INSTANCE_CONFIG_KEYS.LOGIN_BANNER),
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_EXPIRY_TIME,
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_NOTIFICATION_TIME
    );

    const loginBanners = _.fromPairs(
      languagesArr.map(language => {
        const value = values[INSTANCE_CONFIG_KEYS.LOGIN_BANNER(language)];
        return [language, value.orNull()] as [Languages, string | null];
      })
    ) as Record<Languages, string | null>;

    const defaultLanguage = (values[
      INSTANCE_CONFIG_KEYS.DEFAULT_DEFAULT_LANGUAGE
    ] as Maybe<Languages>).orSome(DEFAULT_DEFAULT_LANGUAGE);

    const parentSignatureExpiry = values[
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_EXPIRY_TIME
    ].map(s => +s);
    const parentSignatureNotification = values[
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_NOTIFICATION_TIME
    ].map(s => +s);

    return {
      defaultLanguage,
      loginBanners,
      parentSignatureTimes: {
        expiry: parentSignatureExpiry.orSome(
          DEFAULT_PARENT_SIGNATURE_EXPIRY_TIME
        ),
        notification: parentSignatureNotification.orSome(
          DEFAULT_PARENT_SIGNATURE_NOTIFICATION_TIME
        )
      }
    };
  }

  async getLoginBanners(): Promise<Record<Languages, string | null>> {
    const values = await this.keyValueStoreRepo.getMultiple(
      ...languagesArr.map(INSTANCE_CONFIG_KEYS.LOGIN_BANNER)
    );

    const loginBanners = _.fromPairs(
      languagesArr.map(language => {
        const value = values[INSTANCE_CONFIG_KEYS.LOGIN_BANNER(language)];
        return [language, value.orNull()] as [Languages, string | null];
      })
    ) as Record<Languages, string | null>;

    return loginBanners;
  }

  async getLoginBannerForLanguage(lang: Languages): Promise<Maybe<string>> {
    const key = INSTANCE_CONFIG_KEYS.LOGIN_BANNER(lang);
    return await this.keyValueStoreRepo.get(key);
  }

  async getDefaultLanguage(): Promise<Languages> {
    const value = await this.keyValueStoreRepo.get<Languages>(
      INSTANCE_CONFIG_KEYS.DEFAULT_DEFAULT_LANGUAGE
    );
    return value.orSome(DEFAULT_DEFAULT_LANGUAGE);
  }

  async getParentSignatureTimes(): Promise<ParentSignatureTimesDto> {
    const values = await this.keyValueStoreRepo.getMultiple(
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_EXPIRY_TIME,
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_NOTIFICATION_TIME
    );
    const parentSignatureExpiry = values[
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_EXPIRY_TIME
    ].map(s => +s);
    const parentSignatureNotification = values[
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_NOTIFICATION_TIME
    ].map(s => +s);

    return {
      expiry: parentSignatureExpiry.orSome(
        DEFAULT_PARENT_SIGNATURE_EXPIRY_TIME
      ),
      notification: parentSignatureNotification.orSome(
        DEFAULT_PARENT_SIGNATURE_NOTIFICATION_TIME
      )
    };
  }

  async getParentSignatureExpiryTime(): Promise<number> {
    const value = await this.keyValueStoreRepo.get(
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_EXPIRY_TIME
    );

    return value.map(s => +s).orSome(DEFAULT_PARENT_SIGNATURE_EXPIRY_TIME);
  }

  async getParentSignatureNotificationTime(): Promise<number> {
    const value = await this.keyValueStoreRepo.get(
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_NOTIFICATION_TIME
    );

    return value
      .map(s => +s)
      .orSome(DEFAULT_PARENT_SIGNATURE_NOTIFICATION_TIME);
  }

  async setParentSignatureExpiryTime(
    value: number,
    user: RequestContextUser
  ): Promise<Validation<SetInstanceConfigValueFail, true>> {
    if (user.role !== Roles.ADMIN) {
      return Fail(SetInstanceConfigValueFail.ForbiddenForRole);
    }

    if (!isValidParentSignatureExpiryTime(value)) {
      return Fail(SetInstanceConfigValueFail.IllegalValue);
    }

    await this.keyValueStoreRepo.set(
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_EXPIRY_TIME,
      "" + value
    );
    return Success<SetInstanceConfigValueFail, true>(true);
  }

  async setParentSignatureNotificationTime(
    value: number,
    user: RequestContextUser
  ): Promise<Validation<SetInstanceConfigValueFail, true>> {
    if (user.role !== Roles.ADMIN) {
      return Fail(SetInstanceConfigValueFail.ForbiddenForRole);
    }

    if (!isValidParentSignatureNotificationTime(value)) {
      return Fail(SetInstanceConfigValueFail.IllegalValue);
    }

    await this.keyValueStoreRepo.set(
      INSTANCE_CONFIG_KEYS.PARENT_SIGNATURE_NOTIFICATION_TIME,
      "" + value
    );
    return Success<SetInstanceConfigValueFail, true>(true);
  }

  async setDefaultLanguage(
    lang: Languages,
    user: RequestContextUser
  ): Promise<Validation<SetInstanceConfigValueFail, true>> {
    if (user.role !== Roles.ADMIN) {
      return Fail(SetInstanceConfigValueFail.ForbiddenForRole);
    }

    await this.keyValueStoreRepo.set(
      INSTANCE_CONFIG_KEYS.DEFAULT_DEFAULT_LANGUAGE,
      lang
    );
    return Success<SetInstanceConfigValueFail, true>(true);
  }

  async setLoginBanner(
    lang: Languages,
    bannerText: string | null,
    user: RequestContextUser
  ): Promise<Validation<SetInstanceConfigValueFail, true>> {
    if (user.role !== Roles.ADMIN) {
      return Fail(SetInstanceConfigValueFail.ForbiddenForRole);
    }

    const key = INSTANCE_CONFIG_KEYS.LOGIN_BANNER(lang);
    if (_.isNull(bannerText)) {
      await this.keyValueStoreRepo.remove(key);
    } else {
      await this.keyValueStoreRepo.set(key, bannerText);
    }

    return Success<SetInstanceConfigValueFail, true>(true);
  }
}
