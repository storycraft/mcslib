data modify storage mcs:system registers.r1 set from storage mcs:system arguments[-1][2]
data modify storage mcs:system registers.r2 set from storage mcs:system arguments[-1][0]
function mcs_intrinsic:div with storage mcs:system registers
data modify storage mcs:system registers.r2 set value 3d
function mcs_intrinsic:remi with storage mcs:system registers
data modify storage mcs:system registers.r2 set value 1d
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:eq
data modify storage mcs:system locals[-1][0] set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system arguments[-1][1]
data modify storage mcs:system registers.r2 set from storage mcs:system arguments[-1][0]
function mcs_intrinsic:div with storage mcs:system registers
data modify storage mcs:system registers.r2 set value 3d
function mcs_intrinsic:remi with storage mcs:system registers
data modify storage mcs:system registers.r2 set value 1d
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:eq
data modify storage mcs:system registers.r2 set from storage mcs:system locals[-1][0]
execute store success storage mcs:system registers.r1 double 1 unless predicate mcs_intrinsic:zero unless predicate mcs_intrinsic:zero_r2
execute if predicate mcs_intrinsic:zero run return run function example:__mcslib_nnn_fn1_n_b3
data modify storage mcs:system registers.r1 set value 1d
data remove storage mcs:system locals[-1]
