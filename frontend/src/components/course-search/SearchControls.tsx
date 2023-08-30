import Css from "./SearchControls.module.css";
import * as Feather from "react-feather";

import useStore from "@hooks/store";
import { useAllTerms } from "@hooks/term";
import * as APIv4 from "hyperschedule-shared/api/v4";
import Dropdown from "@components/common/Dropdown";
import { useState } from "react";

export default function SearchControls() {
    const searchText = useStore((store) => store.searchText);
    const setSearchText = useStore((store) => store.setSearchText);
    const allTerms = useAllTerms();
    const activeTerm = useStore((store) => store.mainTab);

    if (allTerms === undefined) return <></>;

    return (
        <div className={Css.searchControls}>
            <Dropdown
                selected={"FA2022"}
                choices={allTerms.map(APIv4.stringifyTermIdentifier)}
                onSelect={(ev) => {}}
            />

            <input
                value={searchText}
                onChange={(ev) => setSearchText(ev.currentTarget.value)}
                placeholder="Search for courses..."
            />
            <button className={Css.filterButton}>
                <Feather.Sliders size={16} />
                Filters
            </button>
        </div>
    );
}
