/**
 * Constant used to simplify calling the
 * Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline class
 * @type {Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline}
 */
const TextureTintPipeline = Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline;

/**
 * The maximum number of lights allowed to render in a scene
 * @type {number}
 */
let LIGHT_COUNT = 10;

/**
 * Custom light pipeline to fix issues with the current diffuse lighting
 * pipeline.
 */
export default class LightPipeline
  extends Phaser.Renderer.WebGL.Pipelines.ForwardDiffuseLightPipeline {
  /**
   * @constructor
   * @override
   */
  constructor( config ) {
    super( config );

    LIGHT_COUNT = config.maxLights;

    /* eslint-disable */
    config.fragShader = [
      '#define SHADER_NAME PHASER_FORWARD_DIFFUSE_FS',
      '',
      'precision mediump float;',
      '',
      'struct Light',
      '{',
      '    vec2 position;',
      '    vec3 color;',
      '    float intensity;',
      '    float radius;',
      '    float hWidth;',
      '    float hHeight;',
      '};',
      '',
      'const int kMaxLights = %LIGHT_COUNT%;',
      '',
      'uniform vec4 uCamera; /* x, y, rotation, zoom */',
      'uniform vec2 uResolution;',
      'uniform sampler2D uMainSampler;',
      'uniform sampler2D uNormSampler;',
      'uniform vec3 uAmbientLightColor;',
      'uniform Light uLights[kMaxLights];',
      '',
      'varying vec2 outTexCoord;',
      'varying vec4 outTint;',
      '',
      'void main()',
      '{',
      '    vec3 finalColor = vec3(0.0, 0.0, 0.0);',
      '    vec4 color = texture2D(uMainSampler, outTexCoord) * vec4(outTint.rgb * outTint.a, outTint.a);',
      '    vec3 normalMap = texture2D(uNormSampler, outTexCoord).rgb;',
      '    vec3 normal = normalize(vec3(normalMap * 2.0 - 1.0));',
      '    vec2 res = vec2(min(uResolution.x, uResolution.y)) * uCamera.w;',
      '',
      '    for (int index = 0; index < kMaxLights; ++index)',
      '    {',
      '        Light light = uLights[index];',
      '        vec3 lightDir = vec3((light.position.xy / res) - (gl_FragCoord.xy / res), 0.2);',
      '        vec3 lightNormal = normalize(lightDir);',
      '        float distToSurf = length(lightDir) * uCamera.w;',
      '        float diffuseFactor = max(dot(normal, lightNormal), 0.0);',
      '        float radius = (light.radius / res.x * uCamera.w) * uCamera.w;',
      '        float attenuation = clamp(1.0 - distToSurf * distToSurf / (radius * radius), 0.0, 1.0);',
      '        vec3 diffuse = light.color * diffuseFactor;',
      '        finalColor += (attenuation * diffuse) * light.intensity;',
      '    }',
      '',
      '    vec4 colorOutput = vec4(uAmbientLightColor + finalColor, 1.0);',
      '    gl_FragColor = color * vec4(colorOutput.rgb * colorOutput.a, colorOutput.a);',
      '',
      '}',
      ''
    ].join( '\n' ).replace( '%LIGHT_COUNT%', LIGHT_COUNT.toString() );
    /* eslint-enable */

    TextureTintPipeline.call( this, config );
  }

  /**
   * @override
   */
  onBind( gameObject ) {
    TextureTintPipeline.prototype.onBind.call( this );

    const renderer = this.renderer;
    const program = this.program;

    this.mvpUpdate();

    renderer.setInt1( program, 'uNormSampler', 1 );
    renderer.setFloat2( program, 'uResolution', this.width, this.height );

    if ( gameObject ) {
      this.setNormalMap( gameObject );
    }

    return this;
  }

  /**
   * @override
   */
  onRender( scene, camera ) {
    /**
     * Whether or not the pipeline is active
     * @type {boolean}
     */
    this.active = false;

    const lightManager = scene.sys.lights;

    if ( !lightManager || lightManager.lights.length <= 0 ||
      !lightManager.active ) {
      // Passthru
      return this;
    }

    const lights = lightManager.cull( camera );
    const lightCount = Math.min( lights.length, LIGHT_COUNT );

    if ( lightCount === 0 ) {
      return this;
    }

    this.active = true;

    const renderer = this.renderer;
    const program = this.program;
    const cameraMatrix = camera.matrix;
    const point = {
      x: 0,
      y: 0
    };
    const height = renderer.height;
    let index;

    for ( index = 0; index < LIGHT_COUNT; ++index ) {
      // Reset lights
      renderer.setFloat1( program, 'uLights[' + index + '].radius', 0 );
    }

    renderer.setFloat4( program, 'uCamera', camera.x, camera.y,
      camera.rotation, camera.zoom );
    renderer.setFloat3( program, 'uAmbientLightColor',
      lightManager.ambientColor.r, lightManager.ambientColor.g,
      lightManager.ambientColor.b );

    for ( index = 0; index < lightCount; ++index ) {
      const light = lights[ index ];
      const lightName = 'uLights[' + index + '].';

      cameraMatrix.transformPoint( light.x, light.y, point );

      renderer.setFloat2( program, lightName + 'position',
        point.x - ( camera.scrollX * light.scrollFactorX * camera.zoom ),
        height - ( point.y - ( camera.scrollY * light.scrollFactorY ) *
        camera.zoom )
      );
      renderer.setFloat3( program, lightName + 'color',
        light.r, light.g, light.b );
      renderer.setFloat1( program, lightName + 'intensity', light.intensity );
      renderer.setFloat1( program, lightName + 'radius', light.radius );

      if ( light.hWidth && light.hHeight ) {
        renderer.setFloat1( program, lightName + 'hWidth', light.hWidth );
        renderer.setFloat1( program, lightName + 'hHeight', light.hHeight );
      }
    }

    return this;
  }

  /**
   * @override
   */
  batchTexture(
    gameObject,
    texture,
    textureWidth, textureHeight,
    srcX, srcY,
    srcWidth, srcHeight,
    scaleX, scaleY,
    rotation,
    flipX, flipY,
    scrollFactorX, scrollFactorY,
    displayOriginX, displayOrig