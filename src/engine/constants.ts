// BS8110-1:1997 — transcribed table values

// Table 3.25 — minimum percentage of steel (fy=460 N/mm²)
export const MIN_STEEL_PERCENT = {
  beamTension: 0.13,    // % bh
  slabTension: 0.13,    // % bh  (fy=460)
  columnMain: 0.4,      // % bh  (gross)
  columnMax: 6.0,       // % bh
};

// Standard UK reinforcement bar areas (mm²)
export const BAR_AREAS: Record<number, number> = {
  6: 28.3,
  8: 50.3,
  10: 78.5,
  12: 113.1,
  16: 201.1,
  20: 314.2,
  25: 490.9,
  32: 804.2,
  40: 1256.6,
};

export const STANDARD_BAR_SIZES = [6, 8, 10, 12, 16, 20, 25, 32, 40];

// Slab bar spacing options (mm/m) — areas per metre width for T bar sizes
// [bar dia, spacing] → As provided per metre width
// Used to select bar/spacing combinations for slabs
export const SLAB_BAR_TABLE: Array<{ dia: number; spacing: number; As: number }> = [
  { dia: 8,  spacing: 200, As: 251  },
  { dia: 8,  spacing: 175, As: 287  },
  { dia: 8,  spacing: 150, As: 335  },
  { dia: 8,  spacing: 125, As: 402  },
  { dia: 10, spacing: 200, As: 393  },
  { dia: 10, spacing: 175, As: 449  },
  { dia: 10, spacing: 150, As: 524  },
  { dia: 10, spacing: 125, As: 628  },
  { dia: 10, spacing: 100, As: 785  },
  { dia: 12, spacing: 200, As: 565  },
  { dia: 12, spacing: 175, As: 646  },
  { dia: 12, spacing: 150, As: 754  },
  { dia: 12, spacing: 125, As: 905  },
  { dia: 12, spacing: 100, As: 1131 },
  { dia: 16, spacing: 200, As: 1005 },
  { dia: 16, spacing: 175, As: 1149 },
  { dia: 16, spacing: 150, As: 1340 },
  { dia: 16, spacing: 125, As: 1608 },
  { dia: 16, spacing: 100, As: 2011 },
  { dia: 20, spacing: 200, As: 1571 },
  { dia: 20, spacing: 175, As: 1795 },
  { dia: 20, spacing: 150, As: 2094 },
];

// BS8110 Table 3.9 — basic span/effective depth ratios
export const TABLE_3_9 = {
  cantilever: 7,
  simplySup: 20,
  continuous: 26,
};

// BS8110 Table 3.5 — moment redistribution β coefficients for continuous beams
// conditions: UDL, imposed ≤ dead, ≥3 spans, span variation ≤15%
export const TABLE_3_5 = {
  at_outer_support:           0.00,  // first/last supports are pinned (0 or -0.04 for end spans)
  at_first_interior_support: -0.10,  // negative (hogging)
  at_middle_supports:        -0.10,
  at_end_spans_midspan:       0.09,
  at_interior_spans_midspan:  0.07,
  near_end_support_end_span:  0.046, // for first span near simple end support
};

// BS8110 Table 3.8 — design concrete shear strength vc (N/mm²)
// Rows: 100·As/(b·d) ratio  Cols: fcu = 25, 30, 35, 40+ N/mm²
// Values interpolated in code
export const TABLE_3_8: Array<{
  ratio: number;
  vc_25: number;
  vc_30: number;
  vc_35: number;
  vc_40: number;
}> = [
  { ratio: 0.15, vc_25: 0.45, vc_30: 0.50, vc_35: 0.53, vc_40: 0.57 },
  { ratio: 0.25, vc_25: 0.53, vc_30: 0.58, vc_35: 0.62, vc_40: 0.66 },
  { ratio: 0.50, vc_25: 0.67, vc_30: 0.73, vc_35: 0.78, vc_40: 0.83 },
  { ratio: 0.75, vc_25: 0.77, vc_30: 0.84, vc_35: 0.90, vc_40: 0.95 },
  { ratio: 1.00, vc_25: 0.84, vc_30: 0.92, vc_35: 0.98, vc_40: 1.04 },
  { ratio: 1.50, vc_25: 0.97, vc_30: 1.06, vc_35: 1.13, vc_40: 1.19 },
  { ratio: 2.00, vc_25: 1.06, vc_30: 1.16, vc_35: 1.24, vc_40: 1.31 },
  { ratio: 3.00, vc_25: 1.22, vc_30: 1.33, vc_35: 1.42, vc_40: 1.50 },
];

// BS8110 Table 3.14 — two-way slab moment coefficients
// Edge conditions 1–9 (BS8110 Table 3.14)
// αsx: short span (lx), αsy: long span (ly)
// Values at ly/lx = 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.75, 2.0
// [neg_sx, pos_sx, neg_sy, pos_sy] at each ly/lx ratio
// neg = support (hogging), pos = span (sagging)
export const TABLE_3_14: Record<string, Array<{
  ratio: number;
  neg_sx: number;
  pos_sx: number;
  neg_sy: number;
  pos_sy: number;
}>> = {
  "1": [ // Interior panels — all edges continuous
    { ratio: 1.0,  neg_sx: 0.031, pos_sx: 0.024, neg_sy: 0.031, pos_sy: 0.024 },
    { ratio: 1.1,  neg_sx: 0.037, pos_sx: 0.028, neg_sy: 0.028, pos_sy: 0.021 },
    { ratio: 1.2,  neg_sx: 0.042, pos_sx: 0.032, neg_sy: 0.024, pos_sy: 0.018 },
    { ratio: 1.3,  neg_sx: 0.046, pos_sx: 0.035, neg_sy: 0.021, pos_sy: 0.016 },
    { ratio: 1.4,  neg_sx: 0.050, pos_sx: 0.037, neg_sy: 0.019, pos_sy: 0.014 },
    { ratio: 1.5,  neg_sx: 0.053, pos_sx: 0.040, neg_sy: 0.017, pos_sy: 0.013 },
    { ratio: 1.75, neg_sx: 0.059, pos_sx: 0.044, neg_sy: 0.014, pos_sy: 0.011 },
    { ratio: 2.0,  neg_sx: 0.063, pos_sx: 0.048, neg_sy: 0.013, pos_sy: 0.009 },
  ],
  "2": [ // One short edge discontinuous
    { ratio: 1.0,  neg_sx: 0.039, pos_sx: 0.029, neg_sy: 0.039, pos_sy: 0.030 },
    { ratio: 1.1,  neg_sx: 0.044, pos_sx: 0.033, neg_sy: 0.035, pos_sy: 0.027 },
    { ratio: 1.2,  neg_sx: 0.048, pos_sx: 0.036, neg_sy: 0.031, pos_sy: 0.024 },
    { ratio: 1.3,  neg_sx: 0.052, pos_sx: 0.039, neg_sy: 0.027, pos_sy: 0.021 },
    { ratio: 1.4,  neg_sx: 0.055, pos_sx: 0.041, neg_sy: 0.025, pos_sy: 0.019 },
    { ratio: 1.5,  neg_sx: 0.058, pos_sx: 0.043, neg_sy: 0.023, pos_sy: 0.017 },
    { ratio: 1.75, neg_sx: 0.063, pos_sx: 0.047, neg_sy: 0.019, pos_sy: 0.014 },
    { ratio: 2.0,  neg_sx: 0.067, pos_sx: 0.050, neg_sy: 0.016, pos_sy: 0.012 },
  ],
  "3": [ // One long edge discontinuous
    { ratio: 1.0,  neg_sx: 0.039, pos_sx: 0.030, neg_sy: 0.039, pos_sy: 0.029 },
    { ratio: 1.1,  neg_sx: 0.049, pos_sx: 0.036, neg_sy: 0.035, pos_sy: 0.027 },
    { ratio: 1.2,  neg_sx: 0.056, pos_sx: 0.042, neg_sy: 0.032, pos_sy: 0.024 },
    { ratio: 1.3,  neg_sx: 0.062, pos_sx: 0.047, neg_sy: 0.029, pos_sy: 0.022 },
    { ratio: 1.4,  neg_sx: 0.068, pos_sx: 0.051, neg_sy: 0.027, pos_sy: 0.020 },
    { ratio: 1.5,  neg_sx: 0.073, pos_sx: 0.055, neg_sy: 0.025, pos_sy: 0.019 },
    { ratio: 1.75, neg_sx: 0.082, pos_sx: 0.062, neg_sy: 0.021, pos_sy: 0.016 },
    { ratio: 2.0,  neg_sx: 0.089, pos_sx: 0.067, neg_sy: 0.019, pos_sy: 0.014 },
  ],
  "4": [ // Two adjacent edges discontinuous
    { ratio: 1.0,  neg_sx: 0.047, pos_sx: 0.036, neg_sy: 0.046, pos_sy: 0.036 },
    { ratio: 1.1,  neg_sx: 0.053, pos_sx: 0.040, neg_sy: 0.041, pos_sy: 0.031 },
    { ratio: 1.2,  neg_sx: 0.057, pos_sx: 0.044, neg_sy: 0.037, pos_sy: 0.028 },
    { ratio: 1.3,  neg_sx: 0.064, pos_sx: 0.048, neg_sy: 0.033, pos_sy: 0.025 },
    { ratio: 1.4,  neg_sx: 0.068, pos_sx: 0.051, neg_sy: 0.030, pos_sy: 0.023 },
    { ratio: 1.5,  neg_sx: 0.071, pos_sx: 0.053, neg_sy: 0.028, pos_sy: 0.021 },
    { ratio: 1.75, neg_sx: 0.078, pos_sx: 0.059, neg_sy: 0.024, pos_sy: 0.018 },
    { ratio: 2.0,  neg_sx: 0.084, pos_sx: 0.063, neg_sy: 0.021, pos_sy: 0.016 },
  ],
  "5": [ // Two short edges discontinuous
    { ratio: 1.0,  neg_sx: 0.000, pos_sx: 0.034, neg_sy: 0.045, pos_sy: 0.034 },
    { ratio: 1.1,  neg_sx: 0.000, pos_sx: 0.038, neg_sy: 0.040, pos_sy: 0.030 },
    { ratio: 1.2,  neg_sx: 0.000, pos_sx: 0.043, neg_sy: 0.035, pos_sy: 0.027 },
    { ratio: 1.3,  neg_sx: 0.000, pos_sx: 0.047, neg_sy: 0.031, pos_sy: 0.024 },
    { ratio: 1.4,  neg_sx: 0.000, pos_sx: 0.050, neg_sy: 0.029, pos_sy: 0.022 },
    { ratio: 1.5,  neg_sx: 0.000, pos_sx: 0.053, neg_sy: 0.027, pos_sy: 0.020 },
    { ratio: 1.75, neg_sx: 0.000, pos_sx: 0.059, neg_sy: 0.023, pos_sy: 0.017 },
    { ratio: 2.0,  neg_sx: 0.000, pos_sx: 0.063, neg_sy: 0.020, pos_sy: 0.015 },
  ],
  "6": [ // Two long edges discontinuous
    { ratio: 1.0,  neg_sx: 0.045, pos_sx: 0.034, neg_sy: 0.000, pos_sy: 0.034 },
    { ratio: 1.1,  neg_sx: 0.055, pos_sx: 0.041, neg_sy: 0.000, pos_sy: 0.031 },
    { ratio: 1.2,  neg_sx: 0.063, pos_sx: 0.047, neg_sy: 0.000, pos_sy: 0.028 },
    { ratio: 1.3,  neg_sx: 0.070, pos_sx: 0.053, neg_sy: 0.000, pos_sy: 0.026 },
    { ratio: 1.4,  neg_sx: 0.077, pos_sx: 0.058, neg_sy: 0.000, pos_sy: 0.024 },
    { ratio: 1.5,  neg_sx: 0.082, pos_sx: 0.062, neg_sy: 0.000, pos_sy: 0.022 },
    { ratio: 1.75, neg_sx: 0.093, pos_sx: 0.070, neg_sy: 0.000, pos_sy: 0.019 },
    { ratio: 2.0,  neg_sx: 0.100, pos_sx: 0.075, neg_sy: 0.000, pos_sy: 0.017 },
  ],
  "7": [ // Three edges discontinuous (one long edge continuous)
    { ratio: 1.0,  neg_sx: 0.057, pos_sx: 0.043, neg_sy: 0.000, pos_sy: 0.044 },
    { ratio: 1.1,  neg_sx: 0.065, pos_sx: 0.048, neg_sy: 0.000, pos_sy: 0.039 },
    { ratio: 1.2,  neg_sx: 0.071, pos_sx: 0.053, neg_sy: 0.000, pos_sy: 0.035 },
    { ratio: 1.3,  neg_sx: 0.076, pos_sx: 0.057, neg_sy: 0.000, pos_sy: 0.032 },
    { ratio: 1.4,  neg_sx: 0.081, pos_sx: 0.060, neg_sy: 0.000, pos_sy: 0.030 },
    { ratio: 1.5,  neg_sx: 0.085, pos_sx: 0.064, neg_sy: 0.000, pos_sy: 0.028 },
    { ratio: 1.75, neg_sx: 0.092, pos_sx: 0.069, neg_sy: 0.000, pos_sy: 0.024 },
    { ratio: 2.0,  neg_sx: 0.098, pos_sx: 0.074, neg_sy: 0.000, pos_sy: 0.021 },
  ],
  "8": [ // Three edges discontinuous (one short edge continuous)
    { ratio: 1.0,  neg_sx: 0.000, pos_sx: 0.042, neg_sy: 0.058, pos_sy: 0.044 },
    { ratio: 1.1,  neg_sx: 0.000, pos_sx: 0.048, neg_sy: 0.051, pos_sy: 0.038 },
    { ratio: 1.2,  neg_sx: 0.000, pos_sx: 0.053, neg_sy: 0.045, pos_sy: 0.034 },
    { ratio: 1.3,  neg_sx: 0.000, pos_sx: 0.057, neg_sy: 0.041, pos_sy: 0.031 },
    { ratio: 1.4,  neg_sx: 0.000, pos_sx: 0.060, neg_sy: 0.037, pos_sy: 0.028 },
    { ratio: 1.5,  neg_sx: 0.000, pos_sx: 0.063, neg_sy: 0.034, pos_sy: 0.025 },
    { ratio: 1.75, neg_sx: 0.000, pos_sx: 0.069, neg_sy: 0.028, pos_sy: 0.021 },
    { ratio: 2.0,  neg_sx: 0.000, pos_sx: 0.074, neg_sy: 0.024, pos_sy: 0.018 },
  ],
  "9": [ // Four edges discontinuous
    { ratio: 1.0,  neg_sx: 0.000, pos_sx: 0.055, neg_sy: 0.000, pos_sy: 0.055 },
    { ratio: 1.1,  neg_sx: 0.000, pos_sx: 0.065, neg_sy: 0.000, pos_sy: 0.049 },
    { ratio: 1.2,  neg_sx: 0.000, pos_sx: 0.073, neg_sy: 0.000, pos_sy: 0.044 },
    { ratio: 1.3,  neg_sx: 0.000, pos_sx: 0.081, neg_sy: 0.000, pos_sy: 0.040 },
    { ratio: 1.4,  neg_sx: 0.000, pos_sx: 0.087, neg_sy: 0.000, pos_sy: 0.036 },
    { ratio: 1.5,  neg_sx: 0.000, pos_sx: 0.092, neg_sy: 0.000, pos_sy: 0.033 },
    { ratio: 1.75, neg_sx: 0.000, pos_sx: 0.103, neg_sy: 0.000, pos_sy: 0.027 },
    { ratio: 2.0,  neg_sx: 0.000, pos_sx: 0.111, neg_sy: 0.000, pos_sy: 0.023 },
  ],
};
