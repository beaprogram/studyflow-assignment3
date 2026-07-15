#!/usr/bin/env python3
"""Build the before/after comparison table from the JMeter CSVs."""
import csv, sys
from collections import defaultdict

def pct(vals, p):
    if not vals: return 0.0
    s = sorted(vals)
    k = (len(s) - 1) * (p / 100.0)
    lo, hi = int(k), min(int(k) + 1, len(s) - 1)
    return s[lo] + (s[hi] - s[lo]) * (k - lo)

def load(path):
    by = defaultdict(list)
    ok = defaultdict(int)
    n  = defaultdict(int)
    t0, t1 = None, None
    with open(path) as f:
        for r in csv.DictReader(f):
            lbl = r['label']
            el  = int(r['elapsed'])
            ts  = int(r['timeStamp'])
            by[lbl].append(el)
            n[lbl] += 1
            if r['success'] == 'true': ok[lbl] += 1
            t0 = ts if t0 is None else min(t0, ts)
            t1 = ts if t1 is None else max(t1, ts + el)
    dur = max((t1 - t0) / 1000.0, 0.001)
    return by, ok, n, dur

def improve(b, a):
    if b == 0: return 0.0
    return (b - a) / b * 100.0

def report(scenario, base_csv, opt_csv):
    b_by, b_ok, b_n, b_dur = load(base_csv)
    o_by, o_ok, o_n, o_dur = load(opt_csv)
    labels = [l for l in b_by if l != 'POST Login'] + (['POST Login'] if 'POST Login' in b_by else [])

    print(f"\n{'='*104}")
    print(f"  {scenario}")
    print(f"{'='*104}")
    hdr = f"{'Endpoint':<22}{'Avg before':>11}{'Avg after':>11}{'Δ%':>8}{'p95 before':>12}{'p95 after':>11}{'Δ%':>8}{'Err%':>7}"
    print(hdr); print('-'*104)
    for l in labels:
        ba, oa = sum(b_by[l])/len(b_by[l]), sum(o_by[l])/len(o_by[l])
        bp, op = pct(b_by[l], 95), pct(o_by[l], 95)
        err = (o_n[l]-o_ok[l])/o_n[l]*100
        print(f"{l:<22}{ba:>10.1f}m{oa:>10.1f}m{improve(ba,oa):>7.1f}%{bp:>11.1f}m{op:>10.1f}m{improve(bp,op):>7.1f}%{err:>6.1f}%")
    ball = [v for l in b_by for v in b_by[l]]
    oall = [v for l in o_by for v in o_by[l]]
    bavg, oavg = sum(ball)/len(ball), sum(oall)/len(oall)
    bp95, op95 = pct(ball,95), pct(oall,95)
    print('-'*104)
    print(f"{'TOTAL':<22}{bavg:>10.1f}m{oavg:>10.1f}m{improve(bavg,oavg):>7.1f}%{bp95:>11.1f}m{op95:>10.1f}m{improve(bp95,op95):>7.1f}%")
    bthr, othr = len(ball)/b_dur, len(oall)/o_dur
    print(f"\nThroughput: {bthr:.2f} req/s before -> {othr:.2f} req/s after  ({improve(bthr,othr)*-1:+.1f}% change)")
    berr = sum(b_n[l]-b_ok[l] for l in b_n)/sum(b_n.values())*100
    oerr = sum(o_n[l]-o_ok[l] for l in o_n)/sum(o_n.values())*100
    print(f"Error rate: {berr:.2f}% before -> {oerr:.2f}% after")

report('LIGHT LOAD (10 users, 30s ramp)', 'baseline-light.csv', 'optimized-light.csv')
report('MODERATE LOAD (50 users, 60s ramp)', 'baseline-moderate.csv', 'optimized-moderate.csv')
print()
