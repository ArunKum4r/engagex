const DataDeletion = () => {
    return (
        <main className="min-h-screen bg-white px-6 py-16 text-gray-900">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-4xl font-bold">
                    Data Deletion
                </h1>

                <p className="mt-4 text-sm text-gray-500">
                    Last updated: September 20, 2026
                </p>

                <section className="mt-10 space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold">
                            Request Data Deletion
                        </h2>

                        <p className="mt-3 leading-7 text-gray-600">
                            If you want your EngageX data deleted, you can
                            disconnect your connected social media account from
                            EngageX or contact the EngageX team with a request
                            for data deletion.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold">
                            Instagram Data
                        </h2>

                        <p className="mt-3 leading-7 text-gray-600">
                            When an Instagram account is disconnected from
                            EngageX, information associated specifically with
                            that connection may be deleted according to our
                            data retention procedures.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold">
                            Deletion Request
                        </h2>

                        <p className="mt-3 leading-7 text-gray-600">
                            To request deletion of your EngageX data, contact
                            the EngageX team and provide the account or
                            workspace information necessary to identify the
                            relevant data.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold">
                            Processing
                        </h2>

                        <p className="mt-3 leading-7 text-gray-600">
                            After verifying the request, applicable data will
                            be deleted or anonymized where required by
                            applicable legal or operational requirements.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default DataDeletion;