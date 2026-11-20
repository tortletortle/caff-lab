# Archived CAFF evidence audit (2026-11-21)

Source: `CAFF_Lab(1).html`, archive commit `c13c906cdf41570bae5c5fda6e64247e54176ad0`, blob `8439bd24136056784ef0f89e3bb5f98dd7db418b`. The first script is the original single-direction navigation prototype (A*, flow field, CAFF). Exact release version is unconfirmed. This audit recomputes statistics from embedded OFFLINE JSON, not a fresh simulation run. Do not label this V2.1 or infer PIBTFast/CAFFLocal availability.

## Experimental scope

325 records, horizon 800; seeds 101, 102, 103, 104, 105; agent counts 200, 600, 1000; maps dual, single, triple, open, reverse. Original metadata: Each row repeated with invariant verification, reported performance excludes checks; sequential single-process Node; no browser FPS measured. Environment recorded: v22.16.0, linux/x64, INTEL(R) XEON(R) PLATINUM 8573C.

## 1000-agent main experiment (5 seeds per map)

| Map | A* mean ticks | Flow mean ticks | CAFF mean ticks | CAFF complete |
|---|---:|---:|---:|---:|
| dual | 440.60 | 408.00 | 236.20 | 5/5 |
| single | 565.80 | 565.80 | 377.80 | 5/5 |
| triple | 261.80 | 261.80 | 183.60 | 5/5 |
| open | 78.00 | 78.00 | 78.00 | 5/5 |
| reverse | 474.00 | 474.00 | 275.40 | 5/5 |

## Matched comparisons

Positive difference means CAFF had fewer ticks. Timeouts are capped at 800 and must not be treated as completion times. All matching uses identical scenario, agent count and seed.

| Baseline | Pairs | CAFF wins/ties/losses | CAFF mean capped ticks | Baseline mean capped ticks |
|---|---:|---:|---:|---:|
| astar | 25 | 20/5/0 | 230.20 | 364.04 |
| flow | 25 | 20/5/0 | 230.20 | 357.52 |
| raw | 20 | 20/0/0 | 268.25 | 741.45 |
| dispatch | 20 | 20/0/0 | 268.25 | 634.25 |
| lane | 20 | 18/0/2 | 268.25 | 352.85 |
| nearestLane | 20 | 19/0/1 | 268.25 | 351.60 |
| density | 20 | 20/0/0 | 268.25 | 427.45 |

## Findings and limitations

- CAFF beats ordinary flow on all 20 archived bottleneck pairs and ties all five open-map pairs. This is not evidence of superiority for general MAPF: all scenarios are static, single-direction and use a shared destination line.
- Compared with lane (same dispatch and lane assignment, without density feedback), CAFF loses on single/seed 101 (5 ticks) and triple/seed 104 (2 ticks). This is evidence of a conditional, rather than universally positive, density effect. Whether those regressions recur on held-out seeds remains untested.
- Nearest-lane and capacity-aware lane assignment differ by map, so use factorial ablation rather than attributing all improvement to the CAFF label.
- Planning time in archived runs is environment-dependent; no new compute performance or runtime invariant checks were performed in this audit. Later V2.1 performance claims remain unverified.

## Next verification, not yet executed

1. Re-run all 325 rows, with verification enabled and deterministic fields matched; exclude timing fields from exact-match assertions.
2. Freeze a held-out set of seeds 1001–1020; compare flow, lane, nearestLane, density and caff at 200/600/1000/1500 units. Record completion separately from censored times, wait, planning time and step time.
3. Evaluate whether the density regressions recur across seeds. Only then consider adaptive feedback in a separately versioned research track. Recover and verify later archived research versions and V2.1 source before adding new algorithm functionality.
