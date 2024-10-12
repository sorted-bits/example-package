import {
  Attribute,
  BaseAttribute,
  BaseAttributeWithState,
  ButtonAttribute,
  ButtonDevice,
  Device,
  DeviceTrackerAttribute,
  DeviceType,
  FanAttribute,
  FanDevice,
  FanState,
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

class ExampleDevice implements Device, SceneDevice, LightDevice, SwitchDevice, NumberDevice, SelectDevice, ButtonDevice, FanDevice {

  private timeAttribute?: BaseAttributeWithState;
  private temperatureAttribute?: BaseAttributeWithState;
  private locationAttribute?: DeviceTrackerAttribute;

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

    this.timeAttribute = this.provider.getAttribute<BaseAttributeWithState>('time');
    this.temperatureAttribute = this.provider.getAttribute<BaseAttributeWithState>('random_temperature');
    this.locationAttribute = this.provider.getAttribute<DeviceTrackerAttribute>('random_location');


    const toggleSunAttribute = this.provider.getAttribute<SwitchAttribute>('toggle_sun');
    if (toggleSunAttribute) {
      this.provider.setAttributeState(toggleSunAttribute, { state: false });
    }

    const sunBrightnessAttribute = this.provider.getAttribute<NumberAttribute>('sun_brightness');
    if (sunBrightnessAttribute) {
      this.provider.setAttributeState(sunBrightnessAttribute, { state: 50 });
    }

    const sunAttribute = this.provider.getAttribute<LightAttribute>('sun');
    if (sunAttribute) {
      this.provider.setAttributeState(sunAttribute, {
        state: false,
        brightness: 25,
        color_mode: 'rgbw',
        color: { r: 100, g: 0, b: 0, w: 125 },
        effect: 'breathing'
      });
    }

    const quantumhubRatingAttribute = this.provider.getAttribute<SelectAttribute>('quantumhub_rating');
    if (quantumhubRatingAttribute) {
      this.provider.setAttributeState(quantumhubRatingAttribute, { state: 'Great' });
    }

    const superFanAttribute = this.provider.getAttribute<FanAttribute>('super_fan');
    if (superFanAttribute) {
      this.provider.setAttributeState(superFanAttribute, {
        state: false,
        percentage: 0,
        direction: 'forward',
        preset_mode: 'auto',
        oscillation: 'oscillate_off'
      });
    }

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
    if (this.timeAttribute) {
      this.provider.setAttributeState(this.timeAttribute, { state: currentDate.toLocaleString('nl-NL', { timeZone: timezone }) });
    }

    //this.provider.logger.trace(`Setting time: ${currentDate.toLocaleString('nl-NL', { timeZone: timezone })}`);

    const randomValue = Math.floor(Math.random() * 100);

    if (this.temperatureAttribute) {
      this.provider.setAttributeState(this.temperatureAttribute, { state: randomValue });
    }

    if (this.locationAttribute) {
      const longitude = Math.floor(Math.random() * 360) - 180;
      const latitude = Math.floor(Math.random() * 180) - 90;
      this.provider.setAttributeState(this.locationAttribute, { latitude, longitude });
    }

    this.timeoutId = this.provider.timeout.set(this.update.bind(this), 5000);
  };

  //#region Event handlers
  onButtonPressed = async (attribute: ButtonAttribute): Promise<void> => {
    this.provider.logger.info('Button pressed:', attribute.name);
  };

  onSelectChanged = async (attribute: SelectAttribute, value: string): Promise<void> => {
    this.provider.logger.info('Select changed:', attribute.name, value);

    this.provider.setAttributeState(attribute, { state: value });
  };

  onNumberChanged = async (attribute: NumberAttribute, value: number): Promise<void> => {
    this.provider.logger.info('Number changed:', attribute.name, value);

    this.provider.setAttributeState(attribute, { state: value });
  };

  onSwitchChanged = async (attribute: SwitchAttribute, value: boolean): Promise<void> => {
    this.provider.logger.info('Switch changed:', attribute.name, value);

    this.provider.setAttributeState(attribute, { state: value });
  };

  onSceneTriggered = async (attribute: SceneAttribute): Promise<void> => {
    this.provider.logger.info('Scene triggered:', attribute.name);
  };

  valueChanged = async (attribute: Attribute, value: any): Promise<void> => {
    this.provider.logger.trace(`Attribute ${attribute.name} changed to ${value}`);
  };

  onLightPowerChanged = async (attribute: LightAttribute, value: boolean): Promise<void> => {
    this.provider.logger.info('Light power changed:', attribute.name, value);

    this.provider.setAttributeState(attribute, { state: value });
  }

  onLightBrightnessChanged = async (attribute: LightAttribute, value: number): Promise<void> => {
    this.provider.logger.info('Light brightness changed:', attribute.name, value);

    this.provider.setAttributeState(attribute, { brightness: value });
  }

  onLightColorChanged = async (attribute: LightAttribute, value: LightColor): Promise<void> => {
    this.provider.logger.info('Light color changed:', attribute.name, value);

    this.provider.setAttributeState(attribute, { color: value });
  }

  onLightEffectChanged = async (attribute: LightAttribute, value: string): Promise<void> => {
    this.provider.logger.info('Light effect changed:', attribute.name, value);

    this.provider.setAttributeState(attribute, { effect: value });
  }

  onFanPowerChanged = async (attribute: FanAttribute, value: boolean): Promise<void> => {
    this.provider.logger.info('Fan power changed:', attribute.name, value);

    this.provider.setAttributeState(attribute, { state: value });
  }

  onFanSpeedChanged = async (attribute: FanAttribute, value: number): Promise<void> => {
    this.provider.logger.info('Speed changed!', value);

    this.provider.setAttributeState(attribute, { percentage: value });
  }
  //#endregion
}

export default ExampleDevice;

