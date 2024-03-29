import type { SubscriptionTypes } from '../enums';

export interface SubscriptionVersions {
    [SubscriptionTypes.ChannelFollow]: '2'
    [SubscriptionTypes.ChannelUpdate]: '2'
    [SubscriptionTypes.ChannelChatClear]: '1'
    [SubscriptionTypes.StreamOnline]: '1'
    [SubscriptionTypes.ChannelAdBreakBegin]: '1'
    [SubscriptionTypes.ChannelChatClearUserMessages]: '1'
    [SubscriptionTypes.ChannelChatMessage]: '1'
}