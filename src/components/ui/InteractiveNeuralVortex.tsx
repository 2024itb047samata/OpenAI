import React, { useEffect, useRef, useState } from "react";

interface InteractiveNeuralVortexProps {
  className?: string;
}

export default function InteractiveNeuralVortex({ className = "" }: InteractiveNeuralVortexProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Track pointer state
  const pointerRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // WebGL Resource references for proper cleanups
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const vertexShaderRef = useRef<WebGLShader | null>(null);
  const fragmentShaderRef = useRef<WebGLShader | null>(null);
  const bufferRef = useRef<WebGLBuffer | null>(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleReducedMotionChange);
    return () => {
      mediaQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  // Listen to container resizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle pointer move event
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      // Calculate coordinates relative to canvas
      pointerRef.current.targetX = e.clientX - rect.left;
      pointerRef.current.targetY = canvas.height / (window.devicePixelRatio || 1) - (e.clientY - rect.top);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  // Initialize and run WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0 || reducedMotion) return;

    // Detect tab visibility to pause animation
    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;

    const gl = canvas.getContext("webgl", { alpha: true, depth: false, antialias: true });
    if (!gl) {
      setWebglSupported(false);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      return;
    }
    glRef.current = gl;

    // Vertex Shader Source
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader Source
    // Muted purple (#1a1532) and cyan (#0b2028), slower swirl, lower brightness (-40%)
    const fsSource = `
      precision mediump float;

      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_opacity;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        // Rotate to reduce axial bias and make swirling look highly organic
        mat2 rot = mat2(0.877, 0.479, -0.479, 0.877);
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Normalize mouse coordinates
        vec2 mouse = (u_mouse - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        float mouseDist = length(p - mouse);

        // Swirling polar coordinates
        float r = length(p);
        float theta = atan(p.y, p.x);

        // Extremely slow and elegant swirl movement (0.05 speed modifier)
        float swirlSpeed = 0.04;
        theta += 0.65 * sin(r * 4.0 - u_time * swirlSpeed);
        vec2 p_swirled = vec2(cos(theta), sin(theta)) * r;

        // Neural filaments generated from Fractal Brownian Motion
        float f = fbm(p_swirled * 3.5 + u_time * 0.015);

        // Create elegant, web-like synapses through fine-lined contrast contours
        float synapse = smoothstep(0.41, 0.46, f) * smoothstep(0.51, 0.46, f);

        // Muted OpenAI / Vercel-style color palette
        vec3 colPurple = vec3(0.12, 0.08, 0.25); // muted slate violet
        vec3 colCyan = vec3(0.04, 0.16, 0.22);   // muted slate teal
        vec3 bg = vec3(5.0 / 255.0, 8.0 / 255.0, 22.0 / 255.0); // exact deep background match

        // Slow color waves along filaments
        vec3 filamentColor = mix(colPurple, colCyan, sin(theta + u_time * 0.05) * 0.5 + 0.5);
        vec3 color = bg + filamentColor * synapse * 0.55;

        // Overlay sharp micro-particles (neural nodes) matching the filaments
        float nodeScale = 12.0;
        vec2 gridId = floor(p_swirled * nodeScale);
        vec2 gridFract = fract(p_swirled * nodeScale) - 0.5;

        vec2 offset = vec2(hash(gridId), hash(gridId + 9.7)) - 0.5;
        float nodeDot = length(gridFract - offset * 0.5);

        // Render nodes only where filaments exist
        float filamentPresence = fbm((gridId / nodeScale) * 3.5);
        float nodeMask = smoothstep(0.40, 0.50, filamentPresence);

        // Muted glowing sharp micro-dots
        float nodeGlow = smoothstep(0.09, 0.01, nodeDot) * 0.35 * nodeMask;
        vec3 nodeCol = mix(vec3(0.35, 0.25, 0.55), vec3(0.15, 0.45, 0.55), hash(gridId));
        color += nodeCol * nodeGlow;

        // Interactive pointer proximity (very soft teal hover bubble)
        if (mouseDist < 0.32) {
          float hoverInfluence = (1.0 - smoothstep(0.0, 0.32, mouseDist)) * 0.12;
          color += vec3(0.1, 0.3, 0.4) * hoverInfluence;
        }

        // Apply a strict 40% overall visual damping to maintain premium subtle design
        color *= 0.60;

        gl_FragColor = vec4(color, u_opacity);
      }
    `;

    // Shader compiler helper function
    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("WebGL shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);

    if (!vs || !fs) {
      setWebglSupported(false);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      return;
    }

    vertexShaderRef.current = vs;
    fragmentShaderRef.current = fs;

    // Create program
    const program = gl.createProgram();
    if (!program) {
      setWebglSupported(false);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      return;
    }
    programRef.current = program;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("WebGL program link error:", gl.getProgramInfoLog(program));
      setWebglSupported(false);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      return;
    }

    // Set up full-screen quad vertex buffer
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const buffer = gl.createBuffer();
    if (!buffer) {
      setWebglSupported(false);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      return;
    }
    bufferRef.current = buffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Look up shader attributes & uniforms
    const positionAttr = gl.getAttribLocation(program, "position");
    const resolutionUniform = gl.getUniformLocation(program, "u_resolution");
    const timeUniform = gl.getUniformLocation(program, "u_time");
    const mouseUniform = gl.getUniformLocation(program, "u_mouse");
    const opacityUniform = gl.getUniformLocation(program, "u_opacity");

    let startTime = performance.now();

    // Initialize pointer coordinates to canvas center
    pointerRef.current.x = canvas.width / 2 / dpr;
    pointerRef.current.y = canvas.height / 2 / dpr;
    pointerRef.current.targetX = pointerRef.current.x;
    pointerRef.current.targetY = pointerRef.current.y;

    const renderLoop = (now: number) => {
      if (!isTabVisible) {
        // Keep tab visible animation frame requested but do not perform heavy drawing
        animationRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Smooth pointer interpolation
      const pointer = pointerRef.current;
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;

      // Clear viewport
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.02, 0.03, 0.08, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      // Bind attributes and uniforms
      gl.enableVertexAttribArray(positionAttr);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);

      // Send uniforms (converted to proper pixels based on DPI)
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
      gl.uniform1f(timeUniform, (now - startTime) * 0.001);
      gl.uniform2f(mouseUniform, pointer.x * dpr, pointer.y * dpr);
      
      // Set opacity around 0.35 - 0.45 as requested
      gl.uniform1f(opacityUniform, 0.42);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(renderLoop);
    };

    animationRef.current = requestAnimationFrame(renderLoop);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      // Cancel animation frame
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      // Cleanup WebGL resources
      const currentGl = glRef.current;
      if (currentGl) {
        if (bufferRef.current) {
          currentGl.deleteBuffer(bufferRef.current);
        }
        if (vertexShaderRef.current) {
          currentGl.deleteShader(vertexShaderRef.current);
        }
        if (fragmentShaderRef.current) {
          currentGl.deleteShader(fragmentShaderRef.current);
        }
        if (programRef.current) {
          currentGl.deleteProgram(programRef.current);
        }
      }

      // Reset pointers
      glRef.current = null;
      programRef.current = null;
      vertexShaderRef.current = null;
      fragmentShaderRef.current = null;
      bufferRef.current = null;
    };
  }, [dimensions, reducedMotion]);

  // Static Gradient Fallback for reduced motion or lack of WebGL support
  if (!webglSupported || reducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`fixed inset-0 w-full h-full bg-[#050816] overflow-hidden pointer-events-none select-none ${className}`}
        style={{ zIndex: 0 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-[#050816] via-[#0d091e] to-[#050816] opacity-40" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-full h-full bg-[#050816] overflow-hidden pointer-events-none select-none ${className}`}
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}
