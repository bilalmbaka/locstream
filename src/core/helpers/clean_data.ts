import { AssetsEntity } from 'src/domain/entities/assets_entity';
import { Asset } from 'src/domain/models/assets_model';
import { User } from 'src/domain/models/user.model';

export class CleanData {
  static cleanUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      disabledReason: user.disabledReason,
      referralId: user.referralId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
    };
  }

  static cleanAsset(asset: AssetsEntity): Asset {
    return {
      id: asset.id,
      url: asset.url,
      thumbnail: asset.thumbnail,
      gif: asset.gif,
      size: asset.fileSize,
      mime: asset.mimeType,
    };
  }
}
