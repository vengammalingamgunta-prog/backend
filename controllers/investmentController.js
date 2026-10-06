import {
    getNAVForDate,
    getLatestNAV,
    getNAVHistory,
    findNAVFromHistory,
    getSchemeDetails
} from "../services/mfapiservices.js";


// ======================================================
// Calculate Lump Sum Returns
// ======================================================

export const calculateLumpsum = async (req, res) => {
    try {
        const { schemeCode } = req.params;
        const years = req.query.years || req.query.year;

        // Validation
        if (!schemeCode || !years) {
            return res.status(400).json({
                status: false,
                message: "schemeCode and years are required"
            });
        }

        if (Number(years) <= 0) {
            return res.status(400).json({
                status: false,
                message: "years must be greater than 0"
            });
        }

        const numberOfYears = Number(years);

        // Calculate date automatically
        const today = new Date();
        const calculatedDate = new Date(today);
        calculatedDate.setFullYear(calculatedDate.getFullYear() - numberOfYears);

        // Format calculated date as DD-MM-YYYY (Fixed for MF API)
        const targetDate = `${String(calculatedDate.getDate()).padStart(2, "0")}-${String(calculatedDate.getMonth() + 1).padStart(2, "0")}-${calculatedDate.getFullYear()}`;

        // Get scheme details
        const schemeData = await getSchemeDetails(schemeCode);

        if (!schemeData || !schemeData.meta) {
            return res.status(404).json({
                status: false,
                message: "Mutual fund scheme not found"
            });
        }

        const schemeName = schemeData.meta.scheme_name;

        // Get NAV for calculated date
        const investmentNAV = await getNAVForDate(schemeCode, targetDate);

        if (!investmentNAV) {
            return res.status(404).json({
                status: false,
                message: "NAV not found for the selected period"
            });
        }

        // Get latest NAV
        const latestNAVData = await getLatestNAV(schemeCode);

        if (!latestNAVData || !latestNAVData.data || latestNAVData.data.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Latest NAV not found"
            });
        }

        const investmentNAVValue = Number(investmentNAV.nav);
        const currentNAV = Number(latestNAVData.data[0].nav);
        const latestNAVDate = latestNAVData.data[0].date;

        // Calculate percentage return
        const returnPercentage = ((currentNAV - investmentNAVValue) / investmentNAVValue) * 100;

        return res.status(200).json({
            status: true,
            data: {
                schemeCode,
                schemeName,
                years: numberOfYears,
                calculatedDate: targetDate,
                navDateUsed: investmentNAV.date,
                investmentNAV: investmentNAVValue,
                latestNAVDate,
                currentNAV,
                returnPercentage: Number(returnPercentage.toFixed(2)),
                result:
                    returnPercentage > 0
                        ? "profit"
                        : returnPercentage < 0
                            ? "loss"
                            : "no profit no loss"
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(502).json({
            status: false,
            message: "Unable to calculate lump sum returns"
        });
    }
};
// ======================================================
// Calculate SIP Returns
// ======================================================

export const calculateSIP = async (req, res) => {

    try {

        const { schemeCode } = req.params;

        const {
            years,
            monthlyAmount
        } = req.query;


        // Validation
        if (!schemeCode || !years || !monthlyAmount) {

            return res.status(400).json({
                status: false,
                message:
                    "schemeCode, years and monthlyAmount are required"
            });
        }


        if (Number(years) <= 0) {

            return res.status(400).json({
                status: false,
                message:
                    "years must be greater than 0"
            });
        }


        if (Number(monthlyAmount) <= 0) {

            return res.status(400).json({
                status: false,
                message:
                    "monthlyAmount must be greater than 0"
            });
        }


        const numberOfYears =
            Number(years);

        const sipAmount =
            Number(monthlyAmount);


        // Today's date
        const today = new Date();


        // Calculate SIP start date
        const start =
            new Date(today);

        start.setFullYear(
            start.getFullYear() - numberOfYears
        );


        // Get scheme details
        const schemeData =
            await getSchemeDetails(schemeCode);


        if (
            !schemeData ||
            !schemeData.meta
        ) {

            return res.status(404).json({
                status: false,
                message: "Mutual fund scheme not found"
            });
        }


        const schemeName =
            schemeData.meta.scheme_name;


        // Get complete NAV history only once
        const historyData =
            await getNAVHistory(schemeCode);


        if (
            !historyData ||
            !historyData.data ||
            historyData.data.length === 0
        ) {

            return res.status(404).json({
                status: false,
                message: "NAV history not found"
            });
        }


        const navHistory =
            historyData.data;


        let totalUnits = 0;

        let totalInvested = 0;

        let totalInstallments = 0;


        // SIP date = same day of month as start date
        const sipDay =
            start.getDate();


        // Start from starting month
        let currentDate =
            new Date(
                start.getFullYear(),
                start.getMonth(),
                1
            );


        // Calculate each monthly SIP internally
        while (currentDate <= today) {

            const year =
                currentDate.getFullYear();

            const month =
                currentDate.getMonth();


            // Last day of current month
            const lastDayOfMonth =
                new Date(
                    year,
                    month + 1,
                    0
                ).getDate();


            // Handle months with fewer days
            const actualDay =
                Math.min(
                    sipDay,
                    lastDayOfMonth
                );


            const sipDateObject =
                new Date(
                    year,
                    month,
                    actualDay
                );


            if (sipDateObject > today) {
                break;
            }


            // Format YYYY-MM-DD
            const sipDate =
                `${year}-${String(month + 1).padStart(2, "0")}-${String(actualDay).padStart(2, "0")}`;


            // Find NAV locally
            const navEntry =
                findNAVFromHistory(
                    navHistory,
                    sipDate
                );


            if (navEntry) {

                const nav =
                    Number(navEntry.nav);


                const units =
                    sipAmount / nav;


                totalUnits += units;

                totalInvested += sipAmount;

                totalInstallments++;
            }


            // Move to next month
            currentDate =
                new Date(
                    year,
                    month + 1,
                    1
                );
        }


        if (totalInstallments === 0) {

            return res.status(404).json({
                status: false,
                message:
                    "No valid NAV found for the selected period"
            });
        }


        // Get latest NAV
        const latestNAVData =
            await getLatestNAV(schemeCode);


        if (
            !latestNAVData ||
            !latestNAVData.data ||
            latestNAVData.data.length === 0
        ) {

            return res.status(404).json({
                status: false,
                message: "Latest NAV not found"
            });
        }


        const currentNAV =
            Number(
                latestNAVData.data[0].nav
            );


        const latestNAVDate =
            latestNAVData.data[0].date;


        // Current value
        const currentValue =
            totalUnits * currentNAV;


        // Profit / Loss
        const profitLoss =
            currentValue - totalInvested;


        // Return percentage
        const returnPercentage =
            (profitLoss / totalInvested) * 100;


        return res.status(200).json({

            status: true,

            data: {

                schemeCode,

                schemeName,

                years:
                    numberOfYears,

                startDate:
                    `${start.getFullYear()}-${String(
                        start.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                        start.getDate()
                    ).padStart(2, "0")}`,

                monthlyAmount:
                    sipAmount,

                totalInstallments,

                totalInvested:
                    Number(
                        totalInvested.toFixed(2)
                    ),

                totalUnits:
                    Number(
                        totalUnits.toFixed(4)
                    ),

                currentNAV,

                latestNAVDate,

                currentValue:
                    Number(
                        currentValue.toFixed(2)
                    ),

                profitLoss:
                    Number(
                        profitLoss.toFixed(2)
                    ),

                returnPercentage:
                    Number(
                        returnPercentage.toFixed(2)
                    ),

                result:
                    profitLoss > 0
                        ? "profit"
                        : profitLoss < 0
                            ? "loss"
                            : "no profit no loss"
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(502).json({
            status: false,
            message: "Unable to calculate SIP returns"
        });
    }
};