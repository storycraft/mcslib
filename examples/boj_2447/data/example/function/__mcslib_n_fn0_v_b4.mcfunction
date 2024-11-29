function example:__mcslib_n_fn0_v_b5 with storage mcs:system stack[-1]
data modify storage mcs:system tmp set value {}
data modify storage mcs:system tmp.a0 set from storage mcs:system stack[-1].a0
data modify storage mcs:system tmp.a1 set from storage mcs:system stack[-1].l1
data modify storage mcs:system tmp.a2 set from storage mcs:system stack[-1].l0
data modify storage mcs:system stack append from storage mcs:system tmp
function example:mcslib_nnn_fn1_n
data modify storage mcs:system registers.r2 set value 1d
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:eq
execute if predicate mcs_intrinsic:zero run return run function example:__mcslib_n_fn0_v_b6
data modify storage example:storage buffer append value "§00"
function example:__mcslib_n_fn0_v_b7
