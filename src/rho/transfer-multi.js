// Rholang code to transfer REVs
// https://github.com/rchain/rchain/blob/3eca061/rholang/examples/vault_demo/3.transfer_funds.rho
/**
 * @param {String} revAddrFrom
 * @param {String[]} revAddrTo
 * @param {number} amount
 * @returns { string }
 */
export const transferMulti_rho = (revAddrFrom, revAddrTo, amount) => `
  new rl(\`rho:registry:lookup\`), RevVaultCh, ListOpsCh in {
    rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
    rl!(\`rho:lang:listOps\`, *ListOpsCh) |
    for (@(_, RevVault) <- RevVaultCh;
         @(_, ListOps) <- ListOpsCh) {
      new vaultCh, vaultTo, revVaultkeyCh,
        deployerId(\`rho:rchain:deployerId\`),
        deployId(\`rho:rchain:deployId\`)
      in {
        match ("${revAddrFrom}", ${amount}) {
          (revAddrFrom, amount) => {
            @RevVault!("findOrCreate", revAddrFrom, *vaultCh) |
            @RevVault!("deployerAuthKey", *deployerId, *revVaultkeyCh) |
            for (@vault <- vaultCh; key <- revVaultkeyCh; _ <- vaultTo) {
              match vault {
                (true, vault) => {
                  @ListOps("parMap", ${JSON.stringify(revAddrTo)}, txfr, deployId) |
                  ///@@@
                  
                  @RevVault!("findOrCreate", revAddrTo, *vaultTo) |
                  new resultCh in {
                    @vault!("transfer", revAddrTo, amount, *key, *resultCh) |
                    for (@result <- resultCh) {
                      match result {
                        (true , _  ) => deployId!((true, "Transfer successful (not yet finalized)."))
                        (false, err) => deployId!((false, err))
                      }
                    }
                  }
                }
                err => {
                  deployId!((false, "REV vault cannot be found or created."))
                }
              }
            }
          }
        }
      }
    }
  }
`
