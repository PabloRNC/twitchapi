import { PostEventSubscriptions } from '@twitchapi/api-types';
import { SubscriptionCallbackManager } from './SubscriptionCallbackManager';
import { EventSubConnection } from './EventSubConnection';
import { SubscriptionTypes } from '../enums/SubscriptionTypes';
import { SubscriptionTypeOptions } from '../interfaces/SubscriptionTypeOptions';
import { SubscriptionOptions } from '../interfaces/SubscriptionOptions';
import { SubscriptionCallback } from '../types/SubscriptionCallback';

export class Subscription<T extends SubscriptionTypes = SubscriptionTypes> {

  public connection: EventSubConnection;

  public auth: string;

  public id: string;

  public nonce: string | null ;

  public type: T;

  public status: string;

  public version: string;

  public options: SubscriptionTypeOptions[T];

  public createdAt: Date;

  public readonly callbacks: SubscriptionCallbackManager<T>;


  public constructor(connection: EventSubConnection, options: SubscriptionOptions<T> , data: PostEventSubscriptions){

    this.connection = connection;
    this.auth = options.auth ?? connection.auth;
    this.type = options.type;
    this.id = data.id;
    this.nonce = options.nonce;
    this.status = data.status;
    this.version = data.version;
    this.options = data.condition as SubscriptionTypeOptions[T];
    this.createdAt = new Date(data.created_at);
    this.callbacks = new SubscriptionCallbackManager(connection, this);

  }


  public onMessage(callback: SubscriptionCallback<T>){

    this.callbacks.add(callback);

  }

  public async delete() {

    await this.connection.helixClient.deleteSubscription(this.id, this.auth);

    this.connection.subscriptions.delete(this.id);

    return;

  }


}