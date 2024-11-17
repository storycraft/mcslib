# -1: local y
# -2: local x
# -3: arg n

# load n in r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-3]
# load x in r2
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-2]
# jump to branch 6 if n <= x
execute if predicate mcs_intrinsic:loe run return run function example:draw_star_b6
# jump to branch 4
return run function example:draw_star_b4