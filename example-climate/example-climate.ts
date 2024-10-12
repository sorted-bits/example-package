import { Attribute, ClimateAttribute, ClimateDevice, ClimateState, Provider } from 'quantumhub-sdk';

class ExampleClimate implements ClimateDevice {
  private climateAttribute!: ClimateAttribute;

  private climateState: ClimateState = {
    current_temperature: 20.5,
    target_temperature: 21.5,
    current_humidity: 56,
    target_humidity: 60,
    swing_mode: 'off',
    preset_mode: 'home',
    mode: 'off',
    fan_mode: 'auto',
    precision: 0.5,
    min_temp: 1,
    max_temp: 32,
    temp_step: 0.5,
    max_humidity: 70,
    min_humidity: 30
  };

  /**
   * Provider instance, this will give you access to the QuantumHub API
   * and allows you to interact with the QuantumHub server.
   *
   * @private
   * @type {Provider}
   * @memberof TestDevice
   */
  private provider!: Provider;

  /**
   * Timeout ID for the update function.
   *
   * @private
   * @type {number}
   * @memberof TestDevice
   */
  private timeoutId: undefined | ReturnType<typeof setTimeout>;

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
    this.provider.logger.info('Starting ExampleClimate');

    const attribute = this.provider.getAttribute<ClimateAttribute>('heater');
    if (attribute) {
      this.climateAttribute = attribute;
    }

    this.provider.setAttributeState(this.climateAttribute, this.climateState);
  };

  /**
   * This method is called when the device is being stopped. For example when the server is being stopped or the device
   * is manually stopped from the web interface (spoiler alert!).
   */
  stop = async (): Promise<void> => {
    this.provider.logger.info('Stopping TestDevice');

    if (this.timeoutId) {
      this.provider.timeout.clear(this.timeoutId);
      this.timeoutId = undefined;
    }
  };

  /**
   * This method is called when the device is being destroyed. This is always the last method that is called on the device.
   */
  destroy = async (): Promise<void> => {
    this.provider.logger.trace('Destroying TestDevice');
  };

  valueChanged = async (attribute: Attribute, value: any): Promise<void> => {
    this.provider.logger.trace(`Attribute ${attribute.name} changed to ${value}`);
  };

  onClimateTargetTemperatureChanged = async (attribute: ClimateAttribute, value: number): Promise<void> => {
    this.provider.logger.trace(`Target temperature changed to ${value}`);

    this.provider.setAttributeState(attribute, { target_temperature: value });
  };

  onClimateFanModeChanged = async (attribute: ClimateAttribute, value: string): Promise<void> => {
    this.provider.logger.trace(`Fan mode changed to ${value}`);

    this.provider.setAttributeState(attribute, { fan_mode: value });
  };

  onClimateSwingModeChanged = async (attribute: ClimateAttribute, value: string): Promise<void> => {
    this.provider.logger.trace(`Swing mode changed to ${value}`);

    this.provider.setAttributeState(attribute, { swing_mode: value });
  };

  onClimatePresetModeChanged = async (attribute: ClimateAttribute, value: string): Promise<void> => {
    this.provider.logger.trace(`Preset mode changed to ${value}`);

    this.provider.setAttributeState(attribute, { preset_mode: value });
  };

  onTargetHumidityChanged = async (attribute: ClimateAttribute, value: number): Promise<void> => {
    this.provider.logger.trace(`Target humidity changed to ${value}`);

    this.provider.setAttributeState(attribute, { target_humidity: value });
  };

  onClimateModeChanged = async (attribute: ClimateAttribute, value: string): Promise<void> => {
    this.provider.logger.trace(`HVAC mode changed to ${value}`);

    this.provider.setAttributeState(attribute, { mode: value });
  };
}

export default ExampleClimate;
