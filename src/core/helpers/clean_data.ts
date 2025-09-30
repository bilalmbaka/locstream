import { AssetsEntity } from 'src/domain/entities/assets_entity';
import { UserEntity } from 'src/domain/entities/user_entity';
import { Asset } from 'src/domain/models/assets_model';
import { User } from 'src/domain/models/user.model';

export class CleanData {
    static cleanUser(user: UserEntity): User {
        return {
            id: user.id,
            email: user.email,
            userName: user.userName,
            emailVerified: user.emailVerified,
            disabled: user.disabled,
            disabledReason: user.disabledReason,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: user.role,
            profilePicture: user.profilePicture ? this.cleanAsset(user.profilePicture) : undefined,
            currentLocation: user.currentLocation
                ? {
                      lat: user.currentLocation.coordinates[1],
                      lng: user.currentLocation.coordinates[0],
                  }
                : undefined,
            currentAddress: user.currentAddress,
            lastSeen: user.lastSeen,
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
