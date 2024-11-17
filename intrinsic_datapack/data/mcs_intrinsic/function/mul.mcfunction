$data modify entity d9ac4c86-54af-44f9-95f5-f749e76b5aed transformation set value [0f,0f,0f,1f,0f,1f,0f,0f,0f,0f,1f,0f,0f,0f,0f,$(r1)f]
data modify storage mcs:system registers.r2 set from entity d9ac4c86-54af-44f9-95f5-f749e76b5aed transformation.translation[0]
function mcs_intrinsic:div with storage mcs:system registers