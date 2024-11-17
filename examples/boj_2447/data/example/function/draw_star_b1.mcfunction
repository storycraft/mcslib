# -1: local y
# -2: local x
# -3: arg n

# load n in r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-3]
# load y in r2
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1]
# jump to branch 7 if n <= y
execute if predicate mcs_intrinsic:loe run return run function example:draw_star_b7

# set x to 0
data modify storage mcs:system stack[-2] set value 0d
# clear buffer
data modify storage example:storage buffer set value []

# jump to branch 3
return run function example:draw_star_b3
