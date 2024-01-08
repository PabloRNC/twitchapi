import { SubscriptionTypes } from '../enums/SubscriptionTypes';

export interface SubscriptionVersions {
    [SubscriptionTypes.ChannelFollow]: '2'
    [SubscriptionTypes.ChannelUpdate]: '2'
    [SubscriptionTypes.ChannelChatClear]: '1'
    [SubscriptionTypes.StreamOnline]: '1'
}