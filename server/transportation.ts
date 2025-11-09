interface Location {
  latitude: number;
  longitude: number;
}

interface JourneyStage {
  stage: string; // e.g., "Walk to Metro", "Metro Ride", "Uber Ride"
  mode: 'walk' | 'metro' | 'uber' | 'bus' | 'train';
  provider?: string;
  fare: number;
  duration?: number; // in minutes
  description: string;
}

interface TransportJourney {
  journeyName: string; // e.g., "Metro + Walk", "Direct Uber"
  totalFare: number;
  totalDuration?: number;
  stages: JourneyStage[];
  recommendation?: string;
}

interface TransportOption {
  mode: 'metro' | 'uber' | 'bus' | 'train';
  provider: string;
  fare: number;
  currency: string;
  duration?: number;
  distance?: number;
  description: string;
  details?: string;
}

export function calculateMetroFare(distanceKm: number, smartCard: boolean = false): number {
  let baseFare: number;
  
  if (distanceKm <= 2) {
    baseFare = 10;
  } else if (distanceKm <= 4) {
    baseFare = 15;
  } else if (distanceKm <= 6) {
    baseFare = 20;
  } else if (distanceKm <= 10) {
    baseFare = 25;
  } else if (distanceKm <= 15) {
    baseFare = 30;
  } else if (distanceKm <= 25) {
    baseFare = 40;
  } else {
    baseFare = 50;
  }
  
  if (smartCard) {
    return Math.round(baseFare * 0.95 * 100) / 100;
  }
  
  return baseFare;
}

export function calculateBusFare(distanceKm: number, serviceType: 'ordinary' | 'vajra' = 'ordinary'): number {
  if (serviceType === 'ordinary') {
    if (distanceKm <= 5) return 10;
    if (distanceKm <= 10) return 15;
    if (distanceKm <= 20) return 20;
    return 25;
  } else {
    if (distanceKm <= 10) return 30;
    if (distanceKm <= 20) return 50;
    return 70;
  }
}

export function calculateTrainFare(distanceKm: number, classType: 'sleeper' | '3ac' | '2ac' = 'sleeper'): number {
  const baseRate = classType === 'sleeper' ? 0.5 : classType === '3ac' ? 1.2 : 2.0;
  const baseFare = distanceKm * baseRate;
  const reservationCharge = classType === 'sleeper' ? 20 : classType === '3ac' ? 40 : 50;
  
  return Math.round((baseFare + reservationCharge) * 1.05);
}

export function calculateRideShareFare(
  distanceKm: number,
  estimatedMinutes: number,
  serviceType: 'ubergo' | 'ola' | 'rapido' = 'ubergo'
): { fare: number; productName: string } {
  // Typical Bengaluru rates (2024)
  const rates = {
    ubergo: { base: 55, perKm: 12, perMin: 1.5, name: 'UberGo' },
    ola: { base: 50, perKm: 10, perMin: 1, name: 'Ola Mini' },
    rapido: { base: 46, perKm: 15, perMin: 0, name: 'Rapido Auto' },
  };
  
  const rate = rates[serviceType];
  const distanceFare = distanceKm * rate.perKm;
  const timeFare = estimatedMinutes * rate.perMin;
  const subtotal = rate.base + distanceFare + timeFare;
  const tax = subtotal * 0.05; // 5% GST
  
  return {
    fare: Math.round(subtotal + tax),
    productName: rate.name,
  };
}

export async function compareTransportation(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  distanceKm: number
): Promise<TransportOption[]> {
  const options: TransportOption[] = [];
  const estimatedMinutes = Math.round(distanceKm * 3); // Rough estimate: ~20 km/h average in city
  
  const metroFare = calculateMetroFare(distanceKm);
  options.push({
    mode: 'metro',
    provider: 'Namma Metro (BMRCL)',
    fare: metroFare,
    currency: 'INR',
    description: `Metro ticket based on ${distanceKm.toFixed(1)}km distance`,
    details: 'Smart card gives 5% discount. Check station connectivity for your route.',
  });
  
  const ordinaryBusFare = calculateBusFare(distanceKm, 'ordinary');
  options.push({
    mode: 'bus',
    provider: 'BMTC Ordinary Bus',
    fare: ordinaryBusFare,
    currency: 'INR',
    description: `Regular AC/Non-AC bus fare for ${distanceKm.toFixed(1)}km`,
    details: 'Multiple routes available. Check Namma BMTC app for real-time tracking.',
  });
  
  const vajraBusFare = calculateBusFare(distanceKm, 'vajra');
  options.push({
    mode: 'bus',
    provider: 'BMTC Vajra (AC Bus)',
    fare: vajraBusFare,
    currency: 'INR',
    description: `Premium AC bus service for ${distanceKm.toFixed(1)}km`,
    details: 'More comfortable than ordinary buses with better seating.',
  });
  
  const uberEstimate = calculateRideShareFare(distanceKm, estimatedMinutes, 'ubergo');
  options.push({
    mode: 'uber',
    provider: uberEstimate.productName,
    fare: uberEstimate.fare,
    currency: 'INR',
    duration: estimatedMinutes,
    distance: distanceKm,
    description: `${uberEstimate.productName} - door to door service`,
    details: `Estimated ${estimatedMinutes} mins. Price may vary with surge pricing.`,
  });
  
  const olaEstimate = calculateRideShareFare(distanceKm, estimatedMinutes, 'ola');
  options.push({
    mode: 'uber',
    provider: olaEstimate.productName,
    fare: olaEstimate.fare,
    currency: 'INR',
    duration: estimatedMinutes,
    distance: distanceKm,
    description: `${olaEstimate.productName} - affordable ride`,
    details: `Estimated ${estimatedMinutes} mins. Price may vary with demand.`,
  });
  
  if (distanceKm < 10) {
    const rapidoEstimate = calculateRideShareFare(distanceKm, estimatedMinutes, 'rapido');
    options.push({
      mode: 'uber',
      provider: rapidoEstimate.productName,
      fare: rapidoEstimate.fare,
      currency: 'INR',
      duration: estimatedMinutes,
      distance: distanceKm,
      description: `${rapidoEstimate.productName} - quick auto ride`,
      details: `Estimated ${estimatedMinutes} mins. Good for short trips.`,
    });
  }
  
  if (distanceKm > 30) {
    const trainFare = calculateTrainFare(distanceKm, 'sleeper');
    options.push({
      mode: 'train',
      provider: 'Indian Railways (Sleeper)',
      fare: trainFare,
      currency: 'INR',
      description: `Train journey for ${distanceKm.toFixed(1)}km`,
      details: 'Check IRCTC for actual train availability and schedules.',
    });
  }
  
  return options.sort((a, b) => a.fare - b.fare);
}

export async function getTransportJourneys(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  distanceKm: number
): Promise<TransportJourney[]> {
  const journeys: TransportJourney[] = [];
  const estimatedMinutes = Math.round(distanceKm * 3); // Rough estimate: ~20 km/h average in city
  
  // Journey 1: Metro + Walk (if distance is suitable)
  if (distanceKm >= 2 && distanceKm <= 30) {
    const metroFare = calculateMetroFare(distanceKm);
    const walkTime = 5; // Assume 5 min walk on each end
    const metroTime = Math.round(distanceKm * 2); // Metro average ~30 km/h
    
    journeys.push({
      journeyName: 'Metro + Walk',
      totalFare: metroFare,
      totalDuration: walkTime + metroTime + walkTime,
      stages: [
        {
          stage: 'Walk to Metro',
          mode: 'walk',
          fare: 0,
          duration: walkTime,
          description: 'Walk to nearest metro station'
        },
        {
          stage: 'Metro Ride',
          mode: 'metro',
          provider: 'Namma Metro',
          fare: metroFare,
          duration: metroTime,
          description: `${distanceKm.toFixed(1)}km metro journey`
        },
        {
          stage: 'Walk to Destination',
          mode: 'walk',
          fare: 0,
          duration: walkTime,
          description: 'Walk to final destination'
        }
      ],
      recommendation: 'Eco-friendly and avoids traffic'
    });
  }
  
  // Journey 2: Direct Bus
  const busFare = calculateBusFare(distanceKm, 'ordinary');
  const busTime = Math.round(distanceKm * 4); // Bus slower in traffic
  
  journeys.push({
    journeyName: 'Direct Bus',
    totalFare: busFare,
    totalDuration: busTime,
    stages: [
      {
        stage: 'Bus Ride',
        mode: 'bus',
        provider: 'BMTC',
        fare: busFare,
        duration: busTime,
        description: `Direct bus for ${distanceKm.toFixed(1)}km`
      }
    ],
    recommendation: 'Most affordable option'
  });
  
  // Journey 3: Direct Uber
  const uberEstimate = calculateRideShareFare(distanceKm, estimatedMinutes, 'ubergo');
  journeys.push({
    journeyName: 'Direct Uber',
    totalFare: uberEstimate.fare,
    totalDuration: estimatedMinutes,
    stages: [
      {
        stage: 'Uber Ride',
        mode: 'uber',
        provider: uberEstimate.productName,
        fare: uberEstimate.fare,
        duration: estimatedMinutes,
        description: 'Door-to-door service'
      }
    ],
    recommendation: 'Fastest and most convenient'
  });
  
  // Journey 4: Direct Ola
  const olaEstimate = calculateRideShareFare(distanceKm, estimatedMinutes, 'ola');
  journeys.push({
    journeyName: 'Direct Ola',
    totalFare: olaEstimate.fare,
    totalDuration: estimatedMinutes,
    stages: [
      {
        stage: 'Ola Ride',
        mode: 'uber',
        provider: olaEstimate.productName,
        fare: olaEstimate.fare,
        duration: estimatedMinutes,
        description: 'Affordable ride-sharing'
      }
    ],
    recommendation: 'Good alternative to Uber'
  });
  
  // Journey 5: Auto (for short trips)
  if (distanceKm < 10) {
    const rapidoEstimate = calculateRideShareFare(distanceKm, estimatedMinutes, 'rapido');
    journeys.push({
      journeyName: 'Auto Rickshaw',
      totalFare: rapidoEstimate.fare,
      totalDuration: estimatedMinutes,
      stages: [
        {
          stage: 'Auto Ride',
          mode: 'uber',
          provider: rapidoEstimate.productName,
          fare: rapidoEstimate.fare,
          duration: estimatedMinutes,
          description: 'Quick auto ride'
        }
      ],
      recommendation: 'Best for short distances'
    });
  }
  
  return journeys.sort((a, b) => a.totalFare - b.totalFare);
}
