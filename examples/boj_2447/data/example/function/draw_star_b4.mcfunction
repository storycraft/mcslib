# -1: local y
# -2: local x
# -3: arg n

# push n
data modify storage mcs:system stack append from storage mcs:system stack[-3]
# push x
data modify storage mcs:system stack append from storage mcs:system stack[-3]
# push y
data modify storage mcs:system stack append from storage mcs:system stack[-3]
# call index4
function example:index4

# insert space if true
data modify storage example:storage buffer append value "§00"
# star if false
execute if predicate mcs_intrinsic:zero run data modify storage example:storage buffer[-1] set value "§d#"

# load x in r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-2]
# load 1 in r2
data modify storage mcs:system registers.r2 set value 1d
# add x + 1
function mcs_intrinsic:add with storage mcs:system registers
# store result to x
data modify storage mcs:system stack[-2] set from storage mcs:system registers.r1
# jump to branch 3
return run function example:draw_star_b3