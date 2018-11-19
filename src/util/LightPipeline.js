const TextureTintPipeline = Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline;
let LIGHT_COUNT = 10;

/**
 * Custom light pipeline to fix issues with the current diffuse lighting
 * pipeline.
 */
export default class LightPipeline extends
  Phaser.Renderer.WebGL.Pipelines.ForwardDiffuseLightPipeline {
  /**
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
    this.active = false;

    const lightManager = scene.sys.lights;

    if ( !lightManager || lightManager.lights.length <= 0 ||
      !lightManager.active ) {
      //  Passthru
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
    const point = {x: 0, y: 0};
    const height = renderer.height;
    let index;

    for ( index = 0; index < LIGHT_COUNT; ++index ) {
      //  Reset lights
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
    displayOriginX, displayOriginY,
    frameX, frameY, frameWidth, frameHeight,
    tintTL, tintTR, tintBL, tintBR, tintEffect,
    uOffset, vOffset,
    camera,
    parentTransformMatrix
  ) {
    if ( !this.active ) {
      return;
    }

    this.renderer.setPipeline( this );

    let normalTexture;

    if ( gameObject.displayTexture ) {
      normalTexture = gameObject.displayTexture
        .dataSource[ gameObject.displayFrame.sourceIndex ];
    }
    else if ( gameObject.texture ) {
      normalTexture = gameObject.texture
        .dataSource[ gameObject.frame.sourceIndex ];
    }
    else if ( gameObject.tileset ) {
      // NOTE: PATCH HERE
      normalTexture = gameObject.tileset[ 0 ].image.dataSource[ 0 ];
    }

    if ( !normalTexture ) {
      console.warn( 'Normal map missing or invalid' );
      return;
    }

    this.setTexture2D( normalTexture.glTexture, 1 );

    const camMatrix = this._tempMatrix1;
    const spriteMatrix = this._tempMatrix2;
    const calcMatrix = this._tempMatrix3;

    let u0 = ( frameX / textureWidth ) + uOffset;
    let v0 = ( frameY / textureHeight ) + vOffset;
    let u1 = ( frameX + frameWidth ) / textureWidth + uOffset;
    let v1 = ( frameY + frameHeight ) / textureHeight + vOffset;

    let width = srcWidth;
    let height = srcHeight;

    // var x = -displayOriginX + frameX;
    // var y = -displayOriginY + frameY;

    let x = -displayOriginX;
    let y = -displayOriginY;

    if ( gameObject.isCropped ) {
      const crop = gameObject._crop;

      width = crop.width;
      height = crop.height;

      srcWidth = crop.width;
      srcHeight = crop.height;

      frameX = crop.x;
      frameY = crop.y;

      let ox = frameX;
      let oy = frameY;

      if ( flipX ) {
        ox = ( frameWidth - crop.x - crop.width );
      }

      if ( flipY && !texture.isRenderTexture ) {
        oy = ( frameHeight - crop.y - crop.height );
      }

      u0 = ( ox / textureWidth ) + uOffset;
      v0 = ( oy / textureHeight ) + vOffset;
      u1 = ( ox + crop.width ) / textureWidth + uOffset;
      v1 = ( oy + crop.height ) / textureHeight + vOffset;

      x = -displayOriginX + frameX;
      y = -displayOriginY + frameY;
    }

    //  Invert the flipY if this is a RenderTexture
    flipY = flipY ^ ( texture.isRenderTexture ? 1 : 0 );

    if ( flipX ) {
      width *= -1;
      x += srcWidth;
    }

    if ( flipY ) {
      height *= -1;
      y += srcHeight;
    }

    const xw = x + width;
    const yh = y + height;

    spriteMatrix.applyITRS( srcX, srcY, rotation, scaleX, scaleY );

    camMatrix.copyFrom( camera.matrix );

    if ( parentTransformMatrix ) {
      //  Multiply the camera by the parent matrix
      camMatrix.multiplyWithOffset( parentTransformMatrix,
        -camera.scrollX * scrollFactorX, -camera.scrollY * scrollFactorY );

      //  Undo the camera scroll
      spriteMatrix.e = srcX;
      spriteMatrix.f = srcY;

      //  Multiply by the Sprite matrix, store result in calcMatrix
      camMatrix.multiply( spriteMatrix, calcMatrix );
    }
    else {
      spriteMatrix.e -= camera.scrollX * scrollFactorX;
      spriteMatrix.f -= camera.scrollY * scrollFactorY;

      //  Multiply by the Sprite matrix, store result in calcMatrix
      camMatrix.multiply( spriteMatrix, calcMatrix );
    }

    let tx0 = calcMatrix.getX( x, y );
    let ty0 = calcMatrix.getY( x, y );

    let tx1 = calcMatrix.getX( x, yh );
    let ty1 = calcMatrix.getY( x, yh );

    let tx2 = calcMatrix.getX( xw, yh );
    let ty2 = calcMatrix.getY( xw, yh );

    let tx3 = calcMatrix.getX( xw, y );
    let ty3 = calcMatrix.getY( xw, y );

    if ( camera.roundPixels ) {
      tx0 |= 0;
      ty0 |= 0;

      tx1 |= 0;
      ty1 |= 0;

      tx2 |= 0;
      ty2 |= 0;

      tx3 |= 0;
      ty3 |= 0;
    }

    this.setTexture2D( texture, 0 );

    this.batchQuad( tx0, ty0, tx1, ty1, tx2, ty2, tx3, ty3, u0, v0, u1, v1,
      tintTL, tintTR, tintBL, tintBR, tintEffect );
  }
}