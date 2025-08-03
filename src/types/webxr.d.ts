// WebXR Type Definitions for Univo AR/VR Features

declare global {
  interface Navigator {
    xr?: XRSystem;
  }

  interface XRSystem extends EventTarget {
    isSessionSupported(mode: XRSessionMode): Promise<boolean>;
    requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>;
  }

  type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';

  interface XRSessionInit {
    requiredFeatures?: string[];
    optionalFeatures?: string[];
    domOverlay?: {
      root: Element;
    };
  }

  interface XRSession extends EventTarget {
    readonly inputSources: XRInputSourceArray;
    readonly enabledFeatures?: ReadonlyArray<string>;
    readonly visibilityState: XRVisibilityState;
    readonly frameRate?: number;
    readonly supportedFrameRates?: Float32Array;

    updateRenderState(state?: XRRenderStateInit): void;
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
    requestAnimationFrame(callback: XRFrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
    end(): Promise<void>;

    addEventListener(type: 'end', listener: (event: XRSessionEvent) => void): void;
    addEventListener(type: 'inputsourceschange', listener: (event: XRInputSourceChangeEvent) => void): void;
    addEventListener(type: 'select', listener: (event: XRInputSourceEvent) => void): void;
    addEventListener(type: 'selectstart', listener: (event: XRInputSourceEvent) => void): void;
    addEventListener(type: 'selectend', listener: (event: XRInputSourceEvent) => void): void;
    addEventListener(type: 'squeeze', listener: (event: XRInputSourceEvent) => void): void;
    addEventListener(type: 'squeezestart', listener: (event: XRInputSourceEvent) => void): void;
    addEventListener(type: 'squeezeend', listener: (event: XRInputSourceEvent) => void): void;
    addEventListener(type: 'visibilitychange', listener: (event: XRSessionEvent) => void): void;
    addEventListener(type: string, listener: EventListener): void;

    removeEventListener(type: 'end', listener: (event: XRSessionEvent) => void): void;
    removeEventListener(type: 'inputsourceschange', listener: (event: XRInputSourceChangeEvent) => void): void;
    removeEventListener(type: 'select', listener: (event: XRInputSourceEvent) => void): void;
    removeEventListener(type: 'selectstart', listener: (event: XRInputSourceEvent) => void): void;
    removeEventListener(type: 'selectend', listener: (event: XRInputSourceEvent) => void): void;
    removeEventListener(type: 'squeeze', listener: (event: XRInputSourceEvent) => void): void;
    removeEventListener(type: 'squeezestart', listener: (event: XRInputSourceEvent) => void): void;
    removeEventListener(type: 'squeezeend', listener: (event: XRInputSourceEvent) => void): void;
    removeEventListener(type: 'visibilitychange', listener: (event: XRSessionEvent) => void): void;
    removeEventListener(type: string, listener: EventListener): void;
  }

  type XRVisibilityState = 'visible' | 'visible-blurred' | 'hidden';

  interface XRRenderStateInit {
    depthNear?: number;
    depthFar?: number;
    inlineVerticalFieldOfView?: number;
    baseLayer?: XRWebGLLayer;
    layers?: XRLayer[];
  }

  type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';

  interface XRReferenceSpace extends XRSpace {
    getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
    addEventListener(type: 'reset', listener: (event: XRReferenceSpaceEvent) => void): void;
    removeEventListener(type: 'reset', listener: (event: XRReferenceSpaceEvent) => void): void;
  }

  interface XRSpace extends EventTarget {}

  interface XRRigidTransform {
    readonly position: DOMPointReadOnly;
    readonly orientation: DOMPointReadOnly;
    readonly matrix: Float32Array;
    readonly inverse: XRRigidTransform;
  }

  type XRFrameRequestCallback = (time: DOMHighResTimeStamp, frame: XRFrame) => void;

  interface XRFrame {
    readonly session: XRSession;
    readonly predictedDisplayTime: DOMHighResTimeStamp;

    getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
    getPose(space: XRSpace, baseSpace: XRSpace): XRPose | null;
    getJointPose?(joint: XRJointSpace, baseSpace: XRSpace): XRJointPose | null;
    fillJointRadii?(jointSpaces: XRJointSpace[], radii: Float32Array): boolean;
    fillPoses?(spaces: XRSpace[], baseSpace: XRSpace, transforms: Float32Array): boolean;
    getHitTestResults?(hitTestSource: XRHitTestSource): XRHitTestResult[];
    getHitTestResultsForTransientInput?(hitTestSource: XRTransientInputHitTestSource): XRTransientInputHitTestResult[];
    getLightEstimate?(lightProbe: XRLightProbe): XRLightEstimate | null;
    getDepthInformation?(view: XRView): XRCPUDepthInformation | null;
  }

  interface XRViewerPose extends XRPose {
    readonly views: ReadonlyArray<XRView>;
  }

  interface XRPose {
    readonly transform: XRRigidTransform;
    readonly linearVelocity?: DOMPointReadOnly;
    readonly angularVelocity?: DOMPointReadOnly;
    readonly emulatedPosition: boolean;
  }

  interface XRView {
    readonly eye: XREye;
    readonly projectionMatrix: Float32Array;
    readonly transform: XRRigidTransform;
    readonly recommendedViewportScale?: number;
    requestViewportScale?(scale: number): void;
  }

  type XREye = 'none' | 'left' | 'right';

  interface XRInputSourceArray extends Array<XRInputSource> {
    [Symbol.iterator](): IterableIterator<XRInputSource>;
  }

  interface XRInputSource {
    readonly handedness: XRHandedness;
    readonly targetRayMode: XRTargetRayMode;
    readonly targetRaySpace: XRSpace;
    readonly gripSpace?: XRSpace;
    readonly profiles: ReadonlyArray<string>;
    readonly gamepad?: Gamepad;
    readonly hand?: XRHand;
  }

  type XRHandedness = 'none' | 'left' | 'right';
  type XRTargetRayMode = 'gaze' | 'tracked-pointer' | 'screen';

  interface XRHand extends Map<XRHandJoint, XRJointSpace> {
    readonly size: number;
    get(key: XRHandJoint): XRJointSpace | undefined;
    has(key: XRHandJoint): boolean;
    entries(): IterableIterator<[XRHandJoint, XRJointSpace]>;
    keys(): IterableIterator<XRHandJoint>;
    values(): IterableIterator<XRJointSpace>;
    forEach(callbackfn: (value: XRJointSpace, key: XRHandJoint, parent: XRHand) => void, thisArg?: any): void;
  }

  type XRHandJoint = 
    | 'wrist'
    | 'thumb-metacarpal' | 'thumb-phalanx-proximal' | 'thumb-phalanx-distal' | 'thumb-tip'
    | 'index-finger-metacarpal' | 'index-finger-phalanx-proximal' | 'index-finger-phalanx-intermediate' | 'index-finger-phalanx-distal' | 'index-finger-tip'
    | 'middle-finger-metacarpal' | 'middle-finger-phalanx-proximal' | 'middle-finger-phalanx-intermediate' | 'middle-finger-phalanx-distal' | 'middle-finger-tip'
    | 'ring-finger-metacarpal' | 'ring-finger-phalanx-proximal' | 'ring-finger-phalanx-intermediate' | 'ring-finger-phalanx-distal' | 'ring-finger-tip'
    | 'pinky-finger-metacarpal' | 'pinky-finger-phalanx-proximal' | 'pinky-finger-phalanx-intermediate' | 'pinky-finger-phalanx-distal' | 'pinky-finger-tip';

  interface XRJointSpace extends XRSpace {
    readonly jointName: XRHandJoint;
  }

  interface XRJointPose extends XRPose {
    readonly radius: number;
  }

  // Events
  interface XRSessionEvent extends Event {
    readonly session: XRSession;
  }

  interface XRInputSourceChangeEvent extends Event {
    readonly session: XRSession;
    readonly added: ReadonlyArray<XRInputSource>;
    readonly removed: ReadonlyArray<XRInputSource>;
  }

  interface XRInputSourceEvent extends Event {
    readonly frame: XRFrame;
    readonly inputSource: XRInputSource;
  }

  interface XRReferenceSpaceEvent extends Event {
    readonly referenceSpace: XRReferenceSpace;
    readonly transform?: XRRigidTransform;
  }

  // WebGL Layer
  interface XRWebGLLayer extends XRLayer {
    readonly antialias: boolean;
    readonly ignoreDepthValues: boolean;
    readonly fixedFoveation?: number;
    readonly framebuffer: WebGLFramebuffer | null;
    readonly framebufferWidth: number;
    readonly framebufferHeight: number;

    getViewport(view: XRView): XRViewport | null;
  }

  interface XRLayer extends EventTarget {}

  interface XRViewport {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  }

  // Hit Testing
  interface XRHitTestSource {
    cancel(): void;
  }

  interface XRTransientInputHitTestSource {
    cancel(): void;
  }

  interface XRHitTestResult {
    getPose(baseSpace: XRSpace): XRPose | null;
    createAnchor?(): Promise<XRAnchor>;
  }

  interface XRTransientInputHitTestResult {
    readonly inputSource: XRInputSource;
    readonly results: ReadonlyArray<XRHitTestResult>;
  }

  // Anchors
  interface XRAnchor {
    readonly anchorSpace: XRSpace;
    delete(): void;
  }

  // Light Estimation
  interface XRLightProbe extends EventTarget {
    readonly probeSpace: XRSpace;
    addEventListener(type: 'reflectionchange', listener: (event: Event) => void): void;
    removeEventListener(type: 'reflectionchange', listener: (event: Event) => void): void;
  }

  interface XRLightEstimate {
    readonly sphericalHarmonicsCoefficients: Float32Array;
    readonly primaryLightDirection: DOMPointReadOnly;
    readonly primaryLightIntensity: DOMPointReadOnly;
  }

  // Depth Sensing
  interface XRCPUDepthInformation {
    readonly width: number;
    readonly height: number;
    readonly normDepthBufferFromNormView: XRRigidTransform;
    readonly rawValueToMeters: number;

    getDepthInMeters(x: number, y: number): number;
  }

  // WebXR Device API - WebGL Context Extensions
  interface WebGLRenderingContext {
    makeXRCompatible(): Promise<void>;
  }

  interface WebGL2RenderingContext {
    makeXRCompatible(): Promise<void>;
  }

  // Constructor for XRWebGLLayer
  interface XRWebGLLayerInit {
    antialias?: boolean;
    depth?: boolean;
    stencil?: boolean;
    alpha?: boolean;
    ignoreDepthValues?: boolean;
    framebufferScaleFactor?: number;
  }

  declare const XRWebGLLayer: {
    prototype: XRWebGLLayer;
    new(session: XRSession, context: WebGLRenderingContext | WebGL2RenderingContext, layerInit?: XRWebGLLayerInit): XRWebGLLayer;
  };

  // Constructor for XRRigidTransform
  interface DOMPointInit {
    x?: number;
    y?: number;
    z?: number;
    w?: number;
  }

  declare const XRRigidTransform: {
    prototype: XRRigidTransform;
    new(position?: DOMPointInit, orientation?: DOMPointInit): XRRigidTransform;
  };
}

export {};