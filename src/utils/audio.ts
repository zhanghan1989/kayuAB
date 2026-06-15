/**
 * KayuAB - Sound Processing Engine
 * Generates beautiful, tactile, and aquatic synth sounds using Web Audio API. 
 * Includes background ambient water sounds, plucking bubble synth, and level-completion arpeggios.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientNoiseGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private ambientFilter: BiquadFilterNode | null = null;
  private bubbleInterval: any = null;
  
  // Audio state
  private isMuted: boolean = false;
  private soundVolume: number = 0.5;
  private ambientVolume: number = 0.0;
  private currentInstrument: "bubble" | "musicbox" | "marimba" | "keyboard" | "flow" = "bubble";

  constructor() {
    // Initialized lazily on first user interaction to comply with autoplay policy
  }

  public init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master compression and gain
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-15, this.ctx.currentTime);
      compressor.knee.setValueAtTime(35, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.soundVolume, this.ctx.currentTime);

      compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Start beautiful ambient generator
      this.startAmbientSea();
    } catch (e) {
      console.error("Failed to initialize Web Audio API: ", e);
    }
  }

  // Set Mute
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const currentVal = muted ? 0 : this.soundVolume;
      this.masterGain.gain.setTargetAtTime(currentVal, this.ctx.currentTime, 0.1);
    }
  }

  // Set Volume
  public setVolume(volume: number) {
    this.soundVolume = volume;
    if (!this.isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    }
  }

  // Set Ambient Volume
  public setAmbientVolume(volume: number) {
    this.ambientVolume = volume;
    if (this.ambientNoiseGain && this.ctx) {
      this.ambientNoiseGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
    }
  }

  // Set Instrument
  public setInstrument(type: "bubble" | "musicbox" | "marimba" | "keyboard" | "flow") {
    this.currentInstrument = type;
  }

  public getInstrument() {
    return this.currentInstrument;
  }

  private startAmbientSea() {
    if (!this.ctx) return;

    // Create a smooth low pass filtered noise/drone for flowing underwater ambiance
    this.ambientNoiseGain = this.ctx.createGain();
    this.ambientNoiseGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    this.ambientNoiseGain.connect(this.ctx.destination);

    // Filter with custom modulation
    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = "lowpass";
    this.ambientFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    this.ambientFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
    this.ambientFilter.connect(this.ambientNoiseGain);

    // Warm multi-oscillator drone
    const freqList = [55, 110, 165, 220]; // Cozy low frequency harmonics
    freqList.forEach((freq, idx) => {
      if (!this.ctx || !this.ambientFilter) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      const depth = 0.02 + idx * 0.015;
      oscGain.gain.setValueAtTime(depth, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.ambientFilter);
      osc.start();
      this.ambientOscs.push(osc);

      // Super slow LFO to modulate oscillator gain
      this.modulateGainAtSlowSpeed(oscGain, depth);
    });

    // Start auto bubble generator in the background (very sparse)
    this.bubbleInterval = setInterval(() => {
      if (!this.isMuted && Math.random() > 0.4 && this.soundVolume > 0.1) {
        // High sparkling background drop/bubble
        const pitchIdx = Math.floor(Math.random() * 5);
        const randPitches = [523.25, 587.33, 659.25, 783.99, 880.00]; // Pentatonic, safe for ears
        this.playPopSound(randPitches[pitchIdx] * (Math.random() > 0.8 ? 2 : 1), 0.05);
      }
    }, 4000);
  }

  private modulateGainAtSlowSpeed(node: GainNode, baseVal: boolean | number) {
    if (!this.ctx) return;
    const val = typeof baseVal === "number" ? baseVal : 0.05;
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.05 + Math.random() * 0.1, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(val * 0.5, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(node.gain);
    lfo.start();
  }

  // Play rotating snap sound
  public playRotate() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // Quick click / snap frequency drop for mechanical aquatic feel
    osc.frequency.setValueAtTime(320, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.08);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.09);

    // Subtle bubbly sound immediately behind it
    setTimeout(() => {
      this.playPopSound(440 + Math.random() * 200, 0.08);
    }, 15);
  }

  // Basic bubble pop sound
  public playPopSound(freq: number, gainVal: number = 0.18) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const bandpass = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(freq * 1.5, time);
    bandpass.Q.setValueAtTime(3.0, time);

    osc.type = "sine";
    // Fast sweep up for crisp bubbly pop sound
    osc.frequency.setValueAtTime(freq * 0.7, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 2.2, time + 0.05);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.setValueAtTime(gainVal * 1.2, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  // Organ/Bell Pluck for Music Box feel
  public playMusicBox(freq: number, gainVal: number = 0.22) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    // Layer 1: Clean fundamental sine
    const osc1 = this.ctx.createOscillator();
    // Layer 2: Shimmering overtones on triangle
    const osc2 = this.ctx.createOscillator();
    
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2.0, time); // Octave overtone for luxury brightness

    gain1.gain.setValueAtTime(0.0, time);
    gain1.gain.linearRampToValueAtTime(gainVal, time + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

    gain2.gain.setValueAtTime(0.0, time);
    gain2.gain.linearRampToValueAtTime(gainVal * 0.45, time + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc1.connect(gain1);
    osc2.connect(gain2);

    const dest = this.masterGain || this.ctx.destination;
    gain1.connect(dest);
    gain2.connect(dest);

    osc1.start(time);
    osc1.stop(time + 0.95);
    osc2.start(time);
    osc2.stop(time + 0.45);
  }

  // Wooden Wooden marimba-plop
  public playMarimba(freq: number, gainVal: number = 0.25) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    // Wooden percussive attack using transient bandpass sweep
    filter.type = "bandpass";
    filter.Q.setValueAtTime(8, time);
    filter.frequency.setValueAtTime(freq * 2.5, time);
    filter.frequency.exponentialRampToValueAtTime(freq, time + 0.08);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  // Tactile Mechanical Keyboard Click
  public playKeyboardClick(freq: number, gainVal: number = 0.22) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    
    // Low frequency dull thud + high click transient noise
    const oscBody = this.ctx.createOscillator();
    const oscClick = this.ctx.createOscillator();
    const gainBody = this.ctx.createGain();
    const gainClick = this.ctx.createGain();
    
    // Resonant bandpass for wood-like switch housing
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.Q.setValueAtTime(12, time);
    bandpass.frequency.setValueAtTime(850 + (freq * 0.15), time);

    // Fundamental switch resonance
    oscBody.type = "triangle";
    oscBody.frequency.setValueAtTime(220 + (freq * 0.1), time); // light thud

    // High snap of key contact leaf
    oscClick.type = "sine";
    oscClick.frequency.setValueAtTime(3200 + freq, time);
    oscClick.frequency.exponentialRampToValueAtTime(1800, time + 0.02);

    // Transient Envelopes
    gainBody.gain.setValueAtTime(0, time);
    gainBody.gain.linearRampToValueAtTime(gainVal * 0.9, time + 0.002);
    gainBody.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    gainClick.gain.setValueAtTime(0, time);
    gainClick.gain.linearRampToValueAtTime(gainVal * 0.45, time + 0.001);
    gainClick.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

    oscBody.connect(gainBody);
    oscClick.connect(bandpass);
    bandpass.connect(gainClick);

    const dest = this.masterGain || this.ctx.destination;
    gainBody.connect(dest);
    gainClick.connect(dest);

    oscBody.start(time);
    oscBody.stop(time + 0.05);
    oscClick.start(time);
    oscClick.stop(time + 0.02);
  }

  // Wet Flowing Water Splash
  public playFlowWater(freq: number, gainVal: number = 0.24) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;

    // Pitch sweep to simulate filling water bubble
    const osc = this.ctx.createOscillator();
    const oscOver = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 0.9, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.1);

    // Additional drop shimmer
    oscOver.type = "sine";
    oscOver.frequency.setValueAtTime(freq * 3.14, time);
    oscOver.frequency.exponentialRampToValueAtTime(freq * 2.1, time + 0.06);

    filter.type = "peaking";
    filter.Q.setValueAtTime(4.0, time);
    filter.frequency.setValueAtTime(1400, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(gainVal * 0.35, time);
    subGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(filter);
    filter.connect(gain);

    oscOver.connect(subGain);

    const dest = this.masterGain || this.ctx.destination;
    gain.connect(dest);
    subGain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.28);
    oscOver.start(time);
    oscOver.stop(time + 0.1);
  }

  // Single pluck based on current selected instrument
  public playPluck(freq: number, volumeCoeff: number = 1.0) {
    let volume = 0.2 * volumeCoeff;
    if (this.currentInstrument === "bubble") {
      this.playPopSound(freq, volume * 1.1);
    } else if (this.currentInstrument === "musicbox") {
      this.playMusicBox(freq, volume * 1.3);
    } else if (this.currentInstrument === "marimba") {
      this.playMarimba(freq, volume * 1.5);
    } else if (this.currentInstrument === "keyboard") {
      this.playKeyboardClick(freq, volume * 1.6);
    } else if (this.currentInstrument === "flow") {
      this.playFlowWater(freq, volume * 1.8);
    }
  }

  // Triggered when a pipe is connected or water progresses (A flow droplet note)
  public playWaterFlowStep(index: number, maxSteps: number) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // Ascending pentatonic melody
    // C Pentatonic Major scale: C4, D4, E4, G4, A4, C5, D5, E5, G5, A5
    const pentatonic = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50, // C6
      1174.66, // D6
      1318.51  // E6
    ];

    const noteIdx = index % pentatonic.length;
    const freq = pentatonic[noteIdx];
    
    // Dynamic scaling based on visual steps
    this.playPluck(freq, 0.8 + 0.5 * (index / Math.max(maxSteps, 1)));
  }

  // Beautiful chord fan-fare on stage success
  public playSuccessFanfare() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    
    // Cozy and pure Fmaj9 chord
    const root = 174.61; // F3
    const chord = [
      root,       // F3 (Root)
      root * 1.5, // C4 (5th)
      root * 1.88, // E4 (Major 7th)
      root * 2.25, // G4 (9th)
      root * 3.0,  // C5 (Sparkle Octave)
      root * 3.75, // E5 (High shimmer)
    ];

    // Arpeggiate the chord slightly for rich depth
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        
        // Use beautiful long-ringing bell synthesizer for final reward
        const playTime = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const biquad = this.ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, playTime);

        biquad.type = "lowpass";
        biquad.frequency.setValueAtTime(2500, playTime);
        biquad.frequency.exponentialRampToValueAtTime(600, playTime + 1.2);

        gain.gain.setValueAtTime(0, playTime);
        gain.gain.linearRampToValueAtTime(0.18, playTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 2.5);

        osc.connect(biquad);
        biquad.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);

        osc.start(playTime);
        osc.stop(playTime + 2.6);
      }, idx * 110); // Arpeggiated staggering delay
    });
  }

  // Shut down ambient sounds if required (safeguards memory)
  public cleanup() {
    if (this.bubbleInterval) {
      clearInterval(this.bubbleInterval);
    }
    this.ambientOscs.forEach(o => {
      try { o.stop(); } catch(e){}
    });
    this.ambientOscs = [];
  }
}

export const sound = new SoundEngine();
