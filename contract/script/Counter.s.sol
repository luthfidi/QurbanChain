// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {QurbanToken} from "../src/QurbanToken.sol";

contract CounterScript is Script {
    QurbanToken public counter;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        counter = new QurbanToken();

        vm.stopBroadcast();
    }
}
