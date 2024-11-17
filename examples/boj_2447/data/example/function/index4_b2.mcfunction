# -1: local m
# -2: arg y
# -3: arg x
# -4: arg n

# load x in r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-3]
# load m in r2
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1]
# div (x/m)
function mcs_intrinsic:div with storage mcs:system registers
# floor
function mcs_intrinsic:floor
# load 3 in r2
data modify storage mcs:system registers.r2 set value 3d
# remainder (x/m) % 3
function mcs_intrinsic:remi
# load 1 in r2
data modify storage mcs:system registers.r2 set value 1d
# jump to branch 4 if not (x/m) % 3 == 1
execute unless predicate mcs_intrinsic:eq run return run function example:index4_b4

# load y in r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-2]
# load m in r2
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1]
# div (y/m)
function mcs_intrinsic:div with storage mcs:system registers
# floor
function mcs_intrinsic:floor
# load 3 in r2
data modify storage mcs:system registers.r2 set value 3d
# remainder (y/m) % 3
function mcs_intrinsic:remi
# load 1 in r2
data modify storage mcs:system registers.r2 set value 1d
# jump to branch 4 if not (y/m) % 3 == 1
execute unless predicate mcs_intrinsic:eq run return run function example:index4_b4

return run function example:index4_b3
