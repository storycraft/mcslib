# -1: local m
# -2: arg y
# -3: arg x
# -4: arg n

# load m in r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1]
# load 1 in r2
data modify storage mcs:system registers.r2 set value 1d
# jump to branch 5 if not m >= 1
execute unless predicate mcs_intrinsic:goe run return run function example:index4_b5
# jump to branch 2
return run function example:index4_b2