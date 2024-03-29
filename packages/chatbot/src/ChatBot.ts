import { ChatBotEventEmitter } from './structures/ChatBotEventEmitter';
import type { ChatBotCapabilities } from './interfaces/ChatBotCapabilities';
import type { ChatBotOptions } from './interfaces/ChatBotOptions';
import { ChatBotWs } from './websocket/ChatBotWs';
import type { UserTokenAdapter } from '@twitchapi/helix';
import { HelixClient } from '@twitchapi/helix';
import { UserManager } from './structures/managers/UserManager';
import { ChannelManager } from './structures/managers/ChannelManager';
import type { ChatBotUser } from './structures/ChatBotUser';
import type { JoinedChannel } from './structures/JoinedChannel';


/**
 * A Twitch ChatBot.
 * @class
 * @extends EventEmitter
 */

export class ChatBot extends ChatBotEventEmitter {

  /**
     * @description The options of the ChatBot.
     */

  public options: ChatBotOptions;

  /**
     * @description The {@link ChatBotWs} instance of this ChatBot
     */
  public ws: ChatBotWs;

  /**
     * @description The user access token that is provided in the {@link ChatBotOptions}
     */
  protected auth: UserTokenAdapter<boolean>;

  /**
     * @description The ChatBot capabilities provided in the {@link ChatBotOptions}. This capabilities are used to receive some extra Twitch information.
     */
  public capabilities?: ChatBotCapabilities;

  /**
     * @readonly
     * @description An array of {@link JoinedChannel} the bot has joined. This propery doesn't updates when a {@link Channel} is updated.
     */
  public readonly joinedChannels: JoinedChannel[];

  /**
     * @description The Twitch app's ClientId provided in the {@link ChatBotOptions}.
     */
  public clientID: string;

  /**
   * @description The Twitch app's ClientSecret provided in the {@link ChatBotOptions}.
   */

  public clientSecret: string;

  /**
     * @description The helixClient instance of the bot to make https request to Twitch Api. Provided by `@twitchapi/helix` package.
     */
  public helixClient: HelixClient;

  /**
     * @description The Twitch's User of the ChatBot's user.
     */
  public user: ChatBotUser | null;

  /**
     * @description The {@link UserManager} of the ChatBot.
     */
  public users: UserManager;

  /**
     * @description The {@link ChannelManager} of the ChatBot
     */
  public channels: ChannelManager;

  /**
     * @description The nick of the ChatBot which is used to login with Twitch IRC Server.
     */

  public nick: string;

  /**
     * @description If the userNoticeLog is enabled to track important messages sent by Twitch IRC Server.
     */

  public noticeLog: boolean = false;

  /**
     * @description The timestamp, in JavaScript Date format, when the chatbot went online. This value is null if the connection hasn't already been estabilished.
     */

  public readyAt: Date | null;
  /**
     * 
     * @param {ChatBotOptions} options The options to build the ChatBot {@link ChatBotOptions}.
     */

  public constructor(options: ChatBotOptions) {

    super();

    this.options = options;

    this.clientID = options.clientID;

    this.clientSecret = options.clientSecret;

    this.auth = options.auth;

    this.nick = options.nick;

    this.capabilities = options.capabilities;

    this.helixClient = new HelixClient({ clientID: this.clientID, userToken: options.auth, clientSecret: options.clientSecret });

    this.users = new UserManager(this);

    this.channels = new ChannelManager(this);

    this.joinedChannels = [];

    this.noticeLog = options.noticeLog;

    this.readyAt = null;



  }


  /**
     * @returns {ChatBot} The current instance of the {@link ChatBot}.
     */
  public login() {

    this.ws = new ChatBotWs(this, this.nick, this.auth).login();

    return this;

  }

  /**
     * Destroy the WebSocket connection of the ChatBot.
     */
  public destroy() {
    this.ws.connection.close();
  }

  /**
   * Set a new auth to the ChatBot.
   * @param {string} oauth The user token use to create the bot. 
   */

  public setAuth(auth: UserTokenAdapter<boolean>){

    this.auth = auth;

    return this;

  }
  

}