import { UserEntity } from 'src/domain/entities/user_entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { ConnectedUsersService } from './connected_users_service';
import { Constants } from 'src/core/constants/constants';
import { CleanData } from 'src/core/helpers/clean_data';

@EventSubscriber()
export class UserLocationSubscriber implements EntitySubscriberInterface<UserEntity> {
    constructor(
        dataSource: DataSource,
        private connectedUsersService: ConnectedUsersService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return UserEntity;
    }

    //TypeORM gives you tools inside the UpdateEvent to check exactly what changed:
    //     event.updatedColumns → list of columns that were updated

    // event.updatedRelations → list of relations that were updated

    // event.databaseEntity → the entity before the update (from the DB)

    // event.entity → the new entity after the update

    afterUpdate(event: UpdateEvent<UserEntity>): void {
        // Only react if location fields were updated
        const updatedColumns = event.updatedColumns.map((c) => c.propertyName);

        console.log('updated columns', updatedColumns);

        if (!updatedColumns.includes('currentLocation')) {
            return; // skip if location-related fields not changed
        }

        this._fetchUserLocationSubscribers(event, event.entity!['id']!);
    }

    private async _fetchUserLocationSubscribers(
        event: UpdateEvent<any>,
        userId: string,
    ): Promise<UserEntity[]> {
        try {
            const profile = await event.manager.findOne(UserEntity, {
                where: { id: userId },
                relations: ['locationReceivers'],
            });

            if (profile == null) return [];

            const subscribers = profile.locationReceivers;

            const sockets = subscribers.flatMap((subscriber) => {
                //TODO check last seen for each subscriber if the user has not been seen for the past 3 hours send push notification to bring them
                //back to the app.
                return this.connectedUsersService.getUserSockets(subscriber.id);
            });

            sockets.map((socket) => {
                socket.emit(Constants.locationChanged, CleanData.cleanUser(profile));
            });

            return [];
        } catch (e) {
            console.log('Error fetching user location subscribers', e);
            return [];
        }
    }
}
