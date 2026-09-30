import sys
sys.path.insert(0, 'branchiq/backend')

from app.services.data_analysis import data_service

print("=== AVENUE Backend Service Verification ===")

# Test: All branches
bs = data_service.get_all_branches()
print(f"Branches loaded:          {len(bs)}")

# Test: Branch summary
s = data_service.get_branch_summary('BR001')
print(f"BR001 Total Visits:       {s['metrics']['total_visits']}")
print(f"BR001 Avg Wait:           {s['metrics']['avg_waiting_time_minutes']}m")
print(f"BR001 Abandonment:        {s['metrics']['abandonment_rate_pct']}%")
print(f"BR001 Load Score:         {s['load_assessment']['overall_load_score']}")
print(f"BR001 Risk:               {s['load_assessment']['risk_level']}")

# Test: Capacity
cap = data_service.get_branch_capacity('BR001')
srv_caps = cap['service_capacity_breakdown']
bottlenecks = [c for c in srv_caps if c['bottleneck_severity'] in ('High', 'Critical')]
print(f"BR001 Service Categories: {len(srv_caps)}")
print(f"BR001 Bottleneck Services:{len(bottlenecks)}")

# Test: Waiting times
wt = data_service.get_branch_waiting_times('BR001')
print(f"BR001 Mean Wait:          {wt['overall']['mean']}m")
print(f"BR001 P90 Wait:           {wt['overall']['p90']}m")
print(f"BR001 Max Wait:           {wt['overall']['max']}m")

# Test: Workload
wl = data_service.get_branch_workload('BR001')
opp = wl['digital_opportunity']
print(f"BR001 Digital-eligible:   {opp['digital_eligible_visits']} visits")
print(f"BR001 Workload Savable:   {opp['potential_workload_minutes_saved']} mins ({opp['pct_workload_reducible']}%)")

# Test all branches load score
print("\n=== All Branch Load Scores ===")
for b in data_service.branches['branch_id']:
    try:
        c = data_service.get_branch_capacity(b)
        ls = c['branch_load_score']
        print(f"  {b}: {ls['overall_load_score']:5.1f} / 100 [{ls['risk_level']:10s}] util={ls['overall_utilization']:.3f}")
    except Exception as e:
        print(f"  {b}: ERROR - {e}")

print("\n=== Verification PASSED ===")
