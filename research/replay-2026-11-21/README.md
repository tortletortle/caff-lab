# CAFF historical replay and held-out evidence — 2026-11-21

## Provenance and scope

Immutable source: archive commit `c13c906cdf41570bae5c5fda6e64247e54176ad0`, `CAFF_Lab(1).html`, Git blob `8439bd24136056784ef0f89e3bb5f98dd7db418b`. Exact historical release version unknown, not V2.1. Its model is a static 88×52 single-direction grid with a shared destination line; this is not a general MAPF benchmark.

The archived JavaScript core was fetched verbatim and executed in an isolated JS runtime with `verify:true` and horizon 800. Invariant checking is enabled on every tick. Wall-clock timing is omitted from equality and results; no CPU/FPS speedup is claimed. Original archive replay: 225/225 main and 100/100 ablation rows matched every deterministic metric (16 fields); no failures. Held-out: 2,000 runs, no invariant exceptions. There were 40 timed-out runs (flow 20, density 20), not invariant failures. All CAFF runs completed. Raw results follow in four JSON files (500 rows each), fetched back from the repository with exact content match.

## Results

New seeds 1001–1020, 5 maps, 4 sizes (200/600/1000/1500), 5 modes. Paired comparisons by map, size and seed; timeouts represented as 800 only in capped tick comparisons.

| Baseline | Complete | CAFF wins/ties/losses | Mean baseline capped ticks | Mean CAFF capped ticks |
|---|---:|---:|---:|---:|
| flow | 380/400 | 320/80/0 | 281.4425 | 203.9 |
| lane | 400/400 | 217/143/40 | 230.48 | 203.9 |
| nearestLane | 400/400 | 252/104/44 | 232.3525 | 203.9 |
| density | 380/400 | 320/80/0 | 281.4775 | 203.9 |

CAFF complete: 400/400. Both flow and density failed to finish within 800 ticks in all 20 single-bridge cases at n=1500; CAFF averaged 575.95 ticks there.

### Density ablation: CAFF versus lane

| Agents | Wins | Ties | Losses | Mean improvement in ticks | Worst regression in ticks |
|---:|---:|---:|---:|---:|---:|
| 200 | 15 | 78 | 7 | 0.22 | 6 |
| 600 | 50 | 25 | 25 | 3.90 | 19 |
| 1000 | 74 | 20 | 6 | 61.51 | 15 |
| 1500 | 78 | 20 | 2 | 40.69 | 10 |

40/400 regressions, including 25/100 at 600 agents. Regressions occur across all four bottleneck layouts (dual 7, single 15, triple 10, reverse 8); the 80 open cases are ties. Therefore the observed regression is reproducible, not confined to the original two seeds. This is descriptive of the tested maps and population sizes, not proof of universal regression or independent sampling across maps.

At 1500 agents on triple, nearestLane averages 250.6 versus CAFF 261.55; CAFF loses 13/20 pairs, worst loss 37 ticks. The nearestLane comparison changes both dispatch assignment and density, so it alone cannot isolate the cause. A factorial nearest-dispatch × density experiment is needed before attributing this regression. Examine occupancy, contested proposals, arrival imbalance and lane-specific queues; source currently permits only decreasing-distance moves and static lane assignment.

## Reproduction

From repository root with Node.js:

```sh
node research/replay-2026-11-21/verify.cjs
node research/replay-2026-11-21/verify.cjs --heldout
```

The runner checks source Git blob hash and held-out coverage in its CLI, then matches all deterministic fields with invariant checks active. The exported execution functions were smoke-tested on seven archived/held-out cases in the isolated JS runtime, 7/7 matched; the native Node CLI and its filesystem/hash path have not been executed in this session. All 2,325 main experiments were executed separately using the identical source and comparison logic. The raw held-out files have been read back and used for aggregate analysis.

## Next step (not implemented)

Treat the current held-out seeds as development evidence for a future adaptive policy; use a disjoint set such as 2001–2040 and novel layouts for final evaluation. First isolate dispatch and feedback contributions with a factorial design, then compare fixed vs adaptive coefficients with equal baselines and separate completion from time. Do not change core until V2.1 provenance is resolved or a verified historical baseline is explicitly selected for new development. No algorithm core change this round.
