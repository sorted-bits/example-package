import {
  Attribute,
  ButtonAttribute,
  ButtonDevice,
  Device,
  LightAttribute,
  LightColor,
  LightDevice,
  NumberAttribute,
  NumberDevice,
  Provider,
  SceneAttribute,
  SceneDevice,
  SelectAttribute,
  SelectDevice,
  SwitchAttribute,
  SwitchDevice
} from 'quantumhub-sdk';

class ExampleDevice implements Device, SceneDevice, LightDevice, SwitchDevice, NumberDevice, SelectDevice, ButtonDevice {
  // This variable is used to keep track of the state of the sun toggle.
  private sunToggle: boolean = true;
  private lightToggle: boolean = true;
  private quantumhubRating: string = 'Awesome';

  private lightColor: LightColor = { r: 100, g: 0, b: 0, w: 125 };

  private lightData = () => {
    return {
      state: this.lightToggle ? 'ON' : 'OFF',
      brightness: this.lightToggle ? 100 : 25,
      color_mode: 'rgbw',
      color: this.lightColor
    };
  };


  /**
   * Provider instance, this will give you access to the QuantumHub API
   * and allows you to interact with the QuantumHub server.
   *
   * @private
   * @type {Provider}
   * @memberof ExampleDevice
   */
  private provider!: Provider;

  /**
   * Timeout ID for the update function.
   *
   * @private
   * @type {number}
   * @memberof ExampleDevice
   */
  private timeoutId: undefined | NodeJS.Timeout;
  /**
   * This method is called when the packages are being loaded from disk and being cached by the QuantumHub server.
   * You will receive the Provider and Logger instances, which you can store in the class for later use.
   *
   * @param provider
   * @param logger
   * @returns
   */
  init = async (provider: Provider): Promise<boolean> => {
    this.provider = provider;

    return true;
  };

  /**
   * This method is called when the device is being started. This is always AFTER the init method.
   */
  start = async (): Promise<void> => {
    this.provider.logger.info('Starting ExampleDevice');

    /* For the example swich we set the state at start only */
    this.provider.setAttributeValue('toggle_sun', this.sunToggle ? 'ON' : 'OFF');
    this.provider.setAttributeValue('sun_brightness', 75);
    this.provider.setAttributeValue('quantumhub_rating', this.quantumhubRating);

    this.provider.setAttributeValue('sun', this.lightData());

    this.timeoutId = this.provider.timeout.set(async () => {
      this.update();
    }, 1000);

    this.provider.cache.set('last_action', 'start');

  };

  /**
   * This method is called when the device is being stopped. For example when the server is being stopped or the device
   * is manually stopped from the web interface (spoiler alert!).
   */
  stop = async (): Promise<void> => {
    this.provider.logger.info('Stopping ExampleDevice');

    if (this.timeoutId) {
      this.provider.timeout.clear(this.timeoutId);
      this.timeoutId = undefined;
    }
  };

  /**
   * This method is called when the device is being destroyed. This is always the last method that is called on the device.
   */
  destroy = async (): Promise<void> => {
    this.provider.logger.trace('Destroying ExampleDevice');
  };

  /**
   * A simple method that uses a timeout to loop indefinitely and update the time and random temperature attributes.
   */
  private update = async (): Promise<void> => {
    // The `timezone` is a custom configuration value that is set in the QuantumHub server config file for this device.
    const { timezone } = this.provider.getConfig();

    const currentDate = new Date();

    // Here we are triggering the QuantumHub API to update the value of the `time` attribute.
    this.provider.setAttributeValue('time', currentDate.toLocaleString('nl-NL', { timeZone: timezone }));

    //this.provider.logger.trace(`Setting time: ${currentDate.toLocaleString('nl-NL', { timeZone: timezone })}`);

    const randomValue = Math.floor(Math.random() * 100);

    // Here we are triggering the QuantumHub API to update the value of the `random_temperature` attribute.
    this.provider.setAttributeValue('random_temperature', randomValue);

    const longitude = Math.floor(Math.random() * 360) - 180;
    const latitude = Math.floor(Math.random() * 180) - 90;

    this.provider.setAttributeValue('random_location', { latitude: latitude, longitude: longitude });

    // this.timeoutId = this.provider.timeout.set(this.update.bind(this), 1000);

    this.provider.cache.set('last_action', 'update');

  };

  onButtonPressed = async (attribute: ButtonAttribute): Promise<void> => {
    //    this.provider.logger.info('Button pressed:', attribute.name);

    this.lightToggle = !this.lightToggle;
    this.sunToggle = !this.sunToggle;

    this.provider.setAttributeValue('toggle_sun', this.sunToggle ? 'ON' : 'OFF');
    this.provider.setAttributeValue('sun', this.lightData());
  };

  onSelectChanged = async (attribute: SelectAttribute, value: string): Promise<void> => {
    this.provider.logger.info('Select changed:', attribute.name, value);
  };

  onNumberChanged = async (attribute: NumberAttribute, value: number): Promise<void> => {
    this.provider.logger.info('Number changed:', attribute.name, value);
  };

  onSwitchChanged = async (attribute: SwitchAttribute, value: boolean): Promise<void> => {
    this.provider.logger.info('Switch changed:', attribute.name, value);
  };

  onSceneTriggered = async (attribute: SceneAttribute): Promise<void> => {
    this.provider.logger.info('Scene triggered:', attribute.name);
  };

  valueChanged = async (attribute: Attribute, value: any): Promise<void> => {
    this.provider.logger.trace(`Attribute ${attribute.name} changed to ${value}`);
  };

  onLightPowerChanged = async (attribute: LightAttribute, value: boolean): Promise<void> => {
    this.provider.logger.info('Light power changed:', attribute.name, value);
  }

  onLightBrightnessChanged = async (attribute: LightAttribute, value: number): Promise<void> => {
    this.provider.logger.info('Light brightness changed:', attribute.name, value);
  }

  onLightColorChanged = async (attribute: LightAttribute, value: LightColor): Promise<void> => {
    this.provider.logger.info('Light color changed:', attribute.name, value);
  }

  onLightEffectChanged = async (attribute: LightAttribute, value: string): Promise<void> => {
    this.provider.logger.info('Light effect changed:', attribute.name, value);
  }

}

export default ExampleDevice;
