# -1: local m
# -2: arg y
# -3: arg x
# -4: arg n

# load m in r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1]
# load 3 in r2
data modify storage mcs:system registers.r2 set value 3d
# div m / 3
function mcs_intrinsic:div with storage mcs:system registers
# floor
function mcs_intrinsic:floor
# store r1 to m
data modify storage mcs:system stack[-1] set from storage mcs:system registers.r1

# jump to branch 1
return run function example:index4_b1
