data modify storage mcs:system tmp set value []
data modify storage mcs:system tmp append from storage mcs:system arguments[-1][0]
data modify storage mcs:system tmp append from storage mcs:system locals[-1][1]
data modify storage mcs:system tmp append from storage mcs:system locals[-1][0]
data modify storage mcs:system arguments append from storage mcs:system tmp
function example:mcslib_nnn_fn1_n
data remove storage mcs:system arguments[-1]
data modify storage mcs:system registers.r2 set value 1d
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:eq
execute if predicate mcs_intrinsic:zero run return run function example:__mcslib_n_fn0_v_b5
data modify storage example:storage buffer append value "§00"
function example:__mcslib_n_fn0_v_b6
