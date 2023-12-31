import { Structure } from '../mol-model/structure';
import { MmcifFormat } from '../mol-model-formats/structure/mmcif';
export declare function readCIF(path: string): Promise<{
    mmcif: MmcifFormat.Data;
    models: import("../mol-model/structure").Trajectory;
    structures: Structure[];
}>;
export declare function test(): Promise<void>;
