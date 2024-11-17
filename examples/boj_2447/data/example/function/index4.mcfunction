# -1: local m
# -2: arg y
# -3: arg x
# -4: arg n

# local m
data modify storage mcs:system stack append from storage mcs:system stack[-3]
# jump to loop
return run function example:index4_b1